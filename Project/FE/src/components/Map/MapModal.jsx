import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapModal.css';

// Import marker icons directly from leaflet package
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom green marker icon using SVG data URL (no external CDN)
const greenMarkerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41">
  <path fill="#22c55e" stroke="#166534" stroke-width="1" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"/>
  <circle fill="#fff" cx="12.5" cy="12.5" r="5"/>
</svg>
`;

const fieldMarkerIcon = new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(greenMarkerSvg)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadow,
    shadowSize: [41, 41]
});

/**
 * Geocode địa chỉ thành tọa độ sử dụng Nominatim (OpenStreetMap)
 * Free, không cần API key
 * 
 * Strategy:
 * 1. Thử tìm địa chỉ đầy đủ
 * 2. Nếu không tìm thấy, thử đơn giản hóa địa chỉ (bỏ ngách, ngõ, số nhà)
 * 3. Nếu vẫn không tìm thấy, thử tìm theo quận/huyện + thành phố
 */
const geocodeAddress = async (address) => {
    // Các pattern cần thử (từ chi tiết đến tổng quát)
    const addressVariants = [
        address, // Địa chỉ gốc
        simplifyAddress(address), // Đơn giản hóa
        extractDistrictCity(address), // Chỉ quận + thành phố
    ].filter(Boolean);

    for (const addr of addressVariants) {
        try {
            const encodedAddress = encodeURIComponent(addr);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&countrycodes=vn&limit=1`,
                {
                    headers: {
                        'Accept-Language': 'vi',
                        'User-Agent': 'SanSieuToc/1.0', // Required by Nominatim
                    }
                }
            );

            const data = await response.json();

            if (data && data.length > 0) {
                console.log(`Geocoded with address: "${addr}"`, data[0]);
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                    displayName: data[0].display_name,
                    searchedAddress: addr,
                };
            }
        } catch (error) {
            console.error('Geocoding error for:', addr, error);
        }
    }

    return null;
};

/**
 * Đơn giản hóa địa chỉ - bỏ số nhà, ngách, ngõ chi tiết
 * VD: "Ngách 55/470 Đ. Nguyễn Trãi, P. Văn Quán, Thanh Xuân, Hà Nội"
 * → "Nguyễn Trãi, Văn Quán, Thanh Xuân, Hà Nội"
 */
const simplifyAddress = (address) => {
    if (!address) return null;

    let simplified = address
        // Bỏ số nhà, ngách, ngõ
        .replace(/ngách\s*\d+[\/\d]*/gi, '')
        .replace(/ngõ\s*\d+[\/\d]*/gi, '')
        .replace(/số\s*\d+[\/\d\-a-zA-Z]*/gi, '')
        .replace(/^\d+[\/\d\-a-zA-Z]*\s*/g, '')
        // Bỏ viết tắt Đ., P., Q., TP.
        .replace(/\bĐ\.\s*/gi, '')
        .replace(/\bP\.\s*/gi, '')
        .replace(/\bQ\.\s*/gi, '')
        .replace(/\bTP\.\s*/gi, '')
        .replace(/\bTT\.\s*/gi, '')
        // Bỏ "Phường", "Quận", "Thành phố" đầy đủ nhưng giữ tên
        .replace(/\bPhường\s*/gi, '')
        .replace(/\bQuận\s*/gi, '')
        .replace(/\bHuyện\s*/gi, '')
        .replace(/\bThành phố\s*/gi, '')
        // Dọn dẹp
        .replace(/,\s*,/g, ',')
        .replace(/^\s*,\s*/, '')
        .replace(/\s*,\s*$/, '')
        .replace(/\s+/g, ' ')
        .trim();

    return simplified || null;
};

/**
 * Trích xuất quận/huyện + thành phố từ địa chỉ
 * VD: "Ngách 55/470 Đ. Nguyễn Trãi, P. Văn Quán, Thanh Xuân, Hà Nội"
 * → "Thanh Xuân, Hà Nội"
 */
const extractDistrictCity = (address) => {
    if (!address) return null;

    // Tách theo dấu phẩy và lấy 2 phần cuối
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 2) {
        const lastTwo = parts.slice(-2).join(', ');
        // Bỏ các prefix
        return lastTwo
            .replace(/\bQ\.\s*/gi, '')
            .replace(/\bTP\.\s*/gi, '')
            .replace(/\bQuận\s*/gi, '')
            .replace(/\bHuyện\s*/gi, '')
            .replace(/\bThành phố\s*/gi, '')
            .trim();
    }

    return null;
};

/**
 * MapModal Component
 * Hiển thị modal với bản đồ OpenStreetMap
 */
const MapModal = ({ isOpen, onClose, address, fieldName }) => {
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [geocodeInfo, setGeocodeInfo] = useState(null);
    const modalRef = useRef(null);

    // Geocode địa chỉ khi modal mở
    useEffect(() => {
        if (isOpen && address) {
            setLoading(true);
            setError(null);
            setGeocodeInfo(null);

            geocodeAddress(address).then((result) => {
                setLoading(false);
                if (result) {
                    setPosition([result.lat, result.lng]);
                    setGeocodeInfo({
                        searchedAddress: result.searchedAddress,
                        isApproximate: result.searchedAddress !== address,
                    });
                } else {
                    setError('Không tìm thấy địa chỉ trên bản đồ');
                }
            });
        }
    }, [isOpen, address]);

    // Close modal khi click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOpenGoogleMaps = () => {
        const encodedAddress = encodeURIComponent(address);
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    };

    return (
        <div className="map-modal-overlay">
            <div className="map-modal" ref={modalRef}>
                {/* Header */}
                <div className="map-modal-header">
                    <div className="map-modal-title">
                        <span className="material-symbols-outlined">location_on</span>
                        <div>
                            <h3>{fieldName}</h3>
                            <p>{address}</p>
                        </div>
                    </div>
                    <button className="map-modal-close" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Map Container */}
                <div className="map-modal-content">
                    {loading && (
                        <div className="map-loading">
                            <div className="map-loading-spinner"></div>
                            <p>Đang tải bản đồ...</p>
                        </div>
                    )}

                    {error && (
                        <div className="map-error">
                            <span className="material-symbols-outlined">error</span>
                            <p>{error}</p>
                            <button className="btn-open-google" onClick={handleOpenGoogleMaps}>
                                <span className="material-symbols-outlined">open_in_new</span>
                                Mở Google Maps
                            </button>
                        </div>
                    )}

                    {!loading && !error && position && (
                        <>
                            {/* Thông báo vị trí gần đúng */}
                            {geocodeInfo?.isApproximate && (
                                <div className="map-approximate-notice">
                                    <span className="material-symbols-outlined">info</span>
                                    <span>Vị trí hiển thị gần đúng. Sử dụng "Chỉ đường" để xem chính xác trên Google Maps.</span>
                                </div>
                            )}

                            <MapContainer
                                key={`${position[0]}-${position[1]}`}
                                center={position}
                                zoom={16}
                                style={{ height: '400px', width: '100%', flex: 1 }}
                                scrollWheelZoom={true}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                {position && (
                                    <Marker position={position} icon={fieldMarkerIcon}>
                                        <Popup>
                                            <div className="map-popup-content">
                                                <strong>{fieldName}</strong>
                                                <p>{address}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}
                            </MapContainer>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="map-modal-footer">
                    <button className="btn-directions" onClick={handleOpenGoogleMaps}>
                        <span className="material-symbols-outlined">directions</span>
                        Chỉ đường (Google Maps)
                    </button>
                    <button className="btn-close-modal" onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapModal;
