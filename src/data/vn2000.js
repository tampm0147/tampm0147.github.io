import proj4 from 'proj4';

// Danh mục Kinh tuyến trục (KTT) các tỉnh/thành phố theo quy định Bộ TN&MT
export const VN2000_PROVINCES = [
  { id: 'hcm', name: 'TP. Hồ Chí Minh', ktt: 105.75, kttStr: "105°45'", zone3: true },
  { id: 'hn', name: 'Hà Nội', ktt: 105.0, kttStr: "105°00'", zone3: true },
  { id: 'dn', name: 'Đà Nẵng', ktt: 107.75, kttStr: "107°45'", zone3: true },
  { id: 'hp', name: 'Hải Phòng', ktt: 105.75, kttStr: "105°45'", zone3: true },
  { id: 'ct', name: 'Cần Thơ', ktt: 105.0, kttStr: "105°00'", zone3: true },
  { id: 'bd', name: 'Bình Dương', ktt: 105.75, kttStr: "105°45'", zone3: true },
  { id: 'dongnai', name: 'Đồng Nai', ktt: 107.75, kttStr: "107°45'", zone3: true },
  { id: 'brvt', name: 'Bà Rịa - Vũng Tàu', ktt: 107.75, kttStr: "107°45'", zone3: true },
  { id: 'longan', name: 'Long An', ktt: 105.75, kttStr: "105°45'", zone3: true },
  { id: 'tiengiang', name: 'Tiền Giang', ktt: 105.75, kttStr: "105°45'", zone3: true },
  { id: 'bentre', name: 'Bến Tre', ktt: 105.75, kttStr: "105°45'", zone3: true },
  { id: 'dongthap', name: 'Đồng Tháp', ktt: 105.0, kttStr: "105°00'", zone3: true },
  { id: 'angiang', name: 'An Giang', ktt: 104.5, kttStr: "104°30'", zone3: true },
  { id: 'kiengiang', name: 'Kiên Giang', ktt: 104.5, kttStr: "104°30'", zone3: true },
  { id: 'haugiang', name: 'Hậu Giang', ktt: 105.0, kttStr: "105°00'", zone3: true },
  { id: 'soctrang', name: 'Sóc Trăng', ktt: 105.5, kttStr: "105°30'", zone3: true },
  { id: 'baclieu', name: 'Bạc Liêu', ktt: 105.0, kttStr: "105°00'", zone3: true },
  { id: 'camau', name: 'Cà Mau', ktt: 104.5, kttStr: "104°30'", zone3: true },
  { id: 'tayninh', name: 'Tây Ninh', ktt: 105.5, kttStr: "105°30'", zone3: true },
  { id: 'binhphuoc', name: 'Bình Phước', ktt: 106.25, kttStr: "106°15'", zone3: true },
  { id: 'lamdong', name: 'Lâm Đồng', ktt: 107.75, kttStr: "107°45'", zone3: true },
  { id: 'daklak', name: 'Đắk Lắk', ktt: 108.5, kttStr: "108°30'", zone3: true },
  { id: 'daknong', name: 'Đắk Nông', ktt: 107.5, kttStr: "107°30'", zone3: true },
  { id: 'gialai', name: 'Gia Lai', ktt: 108.25, kttStr: "108°15'", zone3: true },
  { id: 'kontum', name: 'Kon Tum', ktt: 107.5, kttStr: "107°30'", zone3: true },
  { id: 'khanhhoa', name: 'Khánh Hòa', ktt: 108.25, kttStr: "108°15'", zone3: true },
  { id: 'ninhthuan', name: 'Ninh Thuận', ktt: 108.25, kttStr: "108°15'", zone3: true },
  { id: 'binhthuan', name: 'Bình Thuận', ktt: 107.75, kttStr: "107°45'", zone3: true },
  { id: 'phuyen', name: 'Phú Yên', ktt: 108.5, kttStr: "108°30'", zone3: true },
  { id: 'binhdinh', name: 'Bình Định', ktt: 108.25, kttStr: "108°15'", zone3: true },
  { id: 'quangngai', name: 'Quảng Ngãi', ktt: 108.0, kttStr: "108°00'", zone3: true },
  { id: 'quangnam', name: 'Quảng Nam', ktt: 107.75, kttStr: "107°45'", zone3: true },
  { id: 'hue', name: 'Thừa Thiên Huế', ktt: 107.0, kttStr: "107°00'", zone3: true },
  { id: 'quangtri', name: 'Quảng Trị', ktt: 106.5, kttStr: "106°30'", zone3: true },
  { id: 'quangbinh', name: 'Quảng Bình', ktt: 106.0, kttStr: "106°00'", zone3: true },
  { id: 'hatinh', name: 'Hà Tĩnh', ktt: 105.5, kttStr: "105°30'", zone3: true },
  { id: 'nghean', name: 'Nghệ An', ktt: 104.75, kttStr: "104°45'", zone3: true },
  { id: 'thanhhoa', name: 'Thanh Hóa', ktt: 105.0, kttStr: "105°00'", zone3: true },
  { id: 'ninhbinh', name: 'Ninh Bình', ktt: 105.0, kttStr: "105°00'", zone3: true },
  { id: 'namdinh', name: 'Nam Định', ktt: 105.5, kttStr: "105°30'", zone3: true },
  { id: 'thaibinh', name: 'Thái Bình', ktt: 105.5, kttStr: "105°30'", zone3: true },
  { id: 'hanam', name: 'Hà Nam', ktt: 105.0, kttStr: "105°00'", zone3: true },
  { id: 'hungyen', name: 'Hưng Yên', ktt: 105.5, kttStr: "105°30'", zone3: true },
  { id: 'haiduong', name: 'Hải Dương', ktt: 105.5, kttStr: "105°30'", zone3: true },
  { id: 'bacninh', name: 'Bắc Ninh', ktt: 105.5, kttStr: "105°30'", zone3: true },
  { id: 'bacgiang', name: 'Bắc Giang', ktt: 107.0, kttStr: "107°00'", zone3: true },
  { id: 'vinhphuc', name: 'Vĩnh Phúc', ktt: 105.0, kttStr: "105°00'", zone3: true },
  { id: 'phutho', name: 'Phú Thọ', ktt: 104.75, kttStr: "104°45'", zone3: true },
  { id: 'thainguyen', name: 'Thái Nguyên', ktt: 105.25, kttStr: "105°15'", zone3: true },
  { id: 'quangninh', name: 'Quảng Ninh', ktt: 106.75, kttStr: "106°45'", zone3: true },
  { id: 'langson', name: 'Lạng Sơn', ktt: 106.5, kttStr: "106°30'", zone3: true },
  { id: 'caobang', name: 'Cao Bằng', ktt: 105.75, kttStr: "105°45'", zone3: true },
  { id: 'backan', name: 'Bắc Kạn', ktt: 105.5, kttStr: "105°30'", zone3: true },
  { id: 'tuyenquang', name: 'Tuyên Quang', ktt: 105.0, kttStr: "105°00'", zone3: true },
  { id: 'hagiang', name: 'Hà Giang', ktt: 104.5, kttStr: "104°30'", zone3: true },
  { id: 'laocai', name: 'Lào Cai', ktt: 103.5, kttStr: "103°30'", zone3: true },
  { id: 'yenbai', name: 'Yên Bái', ktt: 104.25, kttStr: "104°15'", zone3: true },
  { id: 'sonla', name: 'Sơn La', ktt: 103.5, kttStr: "103°30'", zone3: true },
  { id: 'dienbien', name: 'Điện Biên', ktt: 103.0, kttStr: "103°00'", zone3: true },
  { id: 'laichau', name: 'Lai Châu', ktt: 103.0, kttStr: "103°00'", zone3: true },
  { id: 'hoabinh', name: 'Hòa Bình', ktt: 105.0, kttStr: "105°00'", zone3: true },
];

// Định nghĩa VN-2000 Transverse Mercator
export function getVN2000ProjDef(ktt, zone = 3) {
  const scale = zone === 3 ? 0.9999 : 0.9996;
  return `+proj=tmerc +lat_0=0 +lon_0=${ktt} +k=${scale} +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.90441429,-39.30318279,-111.45032835,-0.00928836,0.01975479,-0.00427372,0.252906278 +units=m +no_defs`;
}

// Chuyển đổi VN-2000 (X - Bắc, Y - Đông) sang WGS-84 (Lat, Lon)
export function vn2000ToWgs84(x, y, ktt, zone = 3) {
  try {
    const vnDef = getVN2000ProjDef(ktt, zone);
    // proj4 nhận [easting, northing] = [Y, X]
    const [lon, lat] = proj4(vnDef, 'EPSG:4326', [parseFloat(y), parseFloat(x)]);
    return {
      lat: Number(lat.toFixed(7)),
      lon: Number(lon.toFixed(7)),
      isValid: !isNaN(lat) && !isNaN(lon) && lat >= 8 && lat <= 24 && lon >= 102 && lon <= 112
    };
  } catch (err) {
    console.error('VN-2000 -> WGS84 error:', err);
    return { lat: 0, lon: 0, isValid: false, error: err.message };
  }
}

// Chuyển đổi WGS-84 (Lat, Lon) sang VN-2000 (X - Bắc, Y - Đông)
export function wgs84ToVn2000(lat, lon, ktt, zone = 3) {
  try {
    const vnDef = getVN2000ProjDef(ktt, zone);
    const [y, x] = proj4('EPSG:4326', vnDef, [parseFloat(lon), parseFloat(lat)]);
    return {
      x: Number(x.toFixed(3)), // Northing (X)
      y: Number(y.toFixed(3)), // Easting (Y)
      isValid: !isNaN(x) && !isNaN(y)
    };
  } catch (err) {
    console.error('WGS84 -> VN-2000 error:', err);
    return { x: 0, y: 0, isValid: false, error: err.message };
  }
}
