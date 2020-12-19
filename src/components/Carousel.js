import { Carousel } from 'react-bootstrap';
import { useState, useEffect } from 'react';

export default (props) => {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  return (
    <Carousel style = { { display: "block", minHeight: 80, maxHeight: 350 } } activeIndex={index} onSelect={handleSelect}>
      { 
       props.photos.map((photo)=>{
         console.log("in carousel", photo)
        return (
          <Carousel.Item>
          <img
            className="d-block w-100"
            src={photo.secure_url}
            alt="First slide"
          />
        </Carousel.Item>
        )

        })
       
      }
    </Carousel>
  );
}