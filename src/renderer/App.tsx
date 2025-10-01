import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import egyptMap from '../../assets/world-administrative-boundaries.json'
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';

function Map() {
  const customIcon = new L.Icon({
    iconUrl: require('../../assets/map-marker.png'),
    iconSize: [32, 32], 
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: 'marker-icon'
  });

  const [markers, setMarkers] = useState<
    {
      id: number;
      geocode: [number, number];
      note: string;
      createdAt: Date;
    }[]
  >([]);

  const [modalData, setModalData] = useState<{ isOpen: boolean; curGeocode: [number, number] | null; }>({
    isOpen: false,
    curGeocode: null
  });

  const [markerNote, setmarkerNote] = useState("");

  useEffect(() => {
    const savedMarkers = localStorage.getItem('markers');
    if (savedMarkers) {
      setMarkers(JSON.parse(savedMarkers));
    }
  },[]);

  useEffect(() => {
    localStorage.setItem('markers', JSON.stringify(markers));
  }, [markers]);
  
  const addMarker = (geocode: [number, number], note: string) => {
    setMarkers(prevMarkers => [
        ...prevMarkers,
        {
          id: (prevMarkers.length > 0 ? prevMarkers[prevMarkers.length - 1].id + 1 : 1),
          geocode,
          note,
          createdAt: new Date(),
        }
      ]);
  };

  const deleteMarker = (id: number) => {
    setMarkers(prevMarkers => {
      const filtered = prevMarkers.filter(marker => marker.id !== id);
      // keep ids consistent
      return filtered.map((marker, idx) => ({
        ...marker,
        id: idx + 1,
      }));
    });
  };

  const handleModalInput = () => {
    if (modalData.curGeocode && markerNote.trim() !== "") {
      addMarker(modalData.curGeocode, markerNote.trim());
    }

    setModalData({ isOpen: false, curGeocode: null });
    setmarkerNote("");
  };

  return (
    <div>
      <header>
        <h1>Notes Radar</h1>
      </header>
    
      <main>
    
      <div className='map-section'>
        <MapContainer center={[27.89, 30.53]}zoom={5} minZoom={1} maxZoom={8} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <GeoJSON
            data={egyptMap as GeoJSON.FeatureCollection}
            style={{
              color: "#7372726e",
              weight: 2,
              fillColor: "#DBDBDB",
              fillOpacity: 0.3
            }}
            eventHandlers={{
              click: (e) => {
                console.log(e);
                setModalData({ isOpen: true, curGeocode: [e.latlng.lat, e.latlng.lng] });
              }
            }}
          />

          {(markers.map(marker => (
            <Marker key={marker.id} position={marker.geocode} icon={customIcon}>
              <Popup>
                <div>
                  <p><strong>{marker.note}</strong></p>
                  <small><em>Added on: {marker.createdAt.toLocaleString()}</em></small>
                </div>
              </Popup>
            </Marker>
          )))}

        </MapContainer>

        {modalData.isOpen && (
          <div className="marker-modal">
              <div className='modal-header'>
                <span>Add Note</span>
                <span className='geocode'>  {modalData.curGeocode ? 
                modalData.curGeocode.map((val) => val.toFixed(3)).join(", ")
                : ""
                }</span>
              </div>

              <div className='modal-body'>
                <textarea
                  value={markerNote}
                  onChange={(e) => setmarkerNote(e.target.value)}
                  placeholder="Enter your note..."

                />
                {!markerNote.trim() && (
                  <p style={{ color: "red" }}>Note cannot be empty</p>
                )}
              </div>

              <div className="modal-buttons">
                <button onClick={handleModalInput} disabled={!markerNote.trim()}>Add Marker</button>
                <button onClick={() => setModalData({ isOpen: false, curGeocode: null })}>Cancel</button>
              </div>
          </div>
        )}

      </div>
    
      <div className='notes-section'>
        <h1 className='notes-section-header'>Notes</h1>
    
        <div className='notes-list'>
          {markers.length === 0 ? (
            <div className="notes-item">
              No notes yet. Click on the map to add a note!
            </div>
          ) : (
            markers.map(marker => (
              <div className="notes-item" key={marker.id}>
                <div className="notes-item-header">
                  <span className='geocode'>{marker.geocode.map((val) => val.toFixed(3)).join(", ")}</span>
                  <span  className='created-at'>{marker.createdAt.toLocaleString()}</span>
                  <button className="delete-icon" onClick={() => deleteMarker(marker.id)}>
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                      <path fill="#f44336" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"></path><path fill="#fff" d="M29.656,15.516l2.828,2.828l-14.14,14.14l-2.828-2.828L29.656,15.516z"></path><path fill="#fff" d="M32.484,29.656l-2.828,2.828l-14.14-14.14l2.828-2.828L32.484,29.656z"></path>
                    </svg>
                  </button>
                </div>
                <div className="notes-item-content">{marker.note}</div>
              </div>
            ))
          )}
        </div>
      </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Map />} />
      </Routes>
    </Router>
  );
}
