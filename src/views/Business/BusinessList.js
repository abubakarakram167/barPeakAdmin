import {
 CRow,
 CCol,
 CContainer
} from '@coreui/react'
import Card from './BusinessCard'
import axios from 'axios';
import { useState, useEffect } from 'react';
export default () => {
  const [allBusinesses, setBusinesses]=useState([]);
  const latitude = 32.7970465;
  const longitude = -117.2545220;

  useEffect(() => {
    const fetchData = async()=>{
     try{
      
      const res = await axios.get(`http://localhost:3000/getGoogleMapsResults`);
      // let specificPlaces = data.map(business => business.placeId);
    
      // const filteredBusiness = res.data.results.filter((business)=>{
      //   return(specificPlaces.includes(business.place_id));
      // })
      console.log("the data", res.data);
      setBusinesses(res.data)
     }catch(err){
       console.log("the error", err)
     }  
    }
    fetchData();
  }, []);

  // console.log("the data", allBusinesses);

  return(
    <div>
      <CContainer>
        <CRow style = {{ marginTop: 10 }} >
          { allBusinesses.length && allBusinesses.map((business)=>{
              if(business.business_status === "OPERATIONAL"){
              return(
                <CCol sm="4" >
                  <Card showLink = {true} business = {business} />
                </CCol>
              );
            }
            })
          } 
        </CRow>
      </CContainer>
    </div>
  )
}