import leaflet from "leaflet";
import markerIcon from '~/markerImages/marker-icon.png';
import markerIcon2x from '~/markerImages/marker-icon-2x.png';
import markerShadow from '~/markerImages/marker-shadow.png';

export default leaflet.icon({
    iconUrl:       markerIcon,
		iconRetinaUrl: markerIcon2x,
    shadowUrl:     markerShadow
});