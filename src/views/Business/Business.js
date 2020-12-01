import {
  CTabs,
  CNav,
  CNavItem,
  CNavLink,
  CTabPane,
  CTabContent

} from '@coreui/react'
import Businesslist from './BusinessList';
import { useState, useEffect } from 'react';
import axiosApi from 'axios';
import axios from '../../api';
import { getUserData } from '../../localStorage';
import addBusiness from './addBusiness';

export default () => {  
  const [addedBusiness, setAddedBusinesses]=useState([]);
  const [notAddedBusiness, setNotAddedBusiness] = useState([]);
  const latitude = 32.7970465;
  const longitude = -117.2545220;

  useEffect(() => {
    const fetchData = async()=>{
     try{ 
      const res = await axiosApi.get(`http://localhost:3000/getGoogleMapsResults`);
      const { token } = await getUserData();
      const body = {
        query:`
        query{
          allBusinesses{
            placeId       
          }
        }
        `
      }
      
      const getAllBusiness = await axios.post(`graphql?`,body,{ headers: {
        'Authorization': `Bearer ${token}`
      } });

      const alreadyAddedBusiness = getAllBusiness.data.data.allBusinesses
      
      let alreadyBusinessIds = alreadyAddedBusiness.map(business => business.placeId);
      console.log("alreadyBusinessIds", alreadyBusinessIds)
    
      const googleAlreadyAddedBusiness = res.data.filter((business)=>{
        return(alreadyBusinessIds.includes(business.place_id));
      })

      const notgoogleAlreadyAddedBusiness = res.data.filter((business)=>{
        return(!alreadyBusinessIds.includes(business.place_id));
      })

      setAddedBusinesses(googleAlreadyAddedBusiness);
      setNotAddedBusiness(notgoogleAlreadyAddedBusiness);

      console.log("googleAlreadyAddedBusiness", googleAlreadyAddedBusiness);
      console.log("notggogleAlreadyAddedBusiness", notgoogleAlreadyAddedBusiness);

     }catch(err){
       console.log("the error", err)
     }  
    }
    fetchData();
  }, []);


  return (
    <div>
      <CTabs activeTab="home">
        <CNav variant="tabs">
          <CNavItem>
            <CNavLink data-tab="home">
              ADD Business
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink data-tab="profile">
              Recently ADDED
            </CNavLink>
          </CNavItem>
        </CNav>
        <CTabContent>
          <CTabPane data-tab="home">
            <Businesslist businesses = {notAddedBusiness} update = {false} />
          </CTabPane>
          <CTabPane data-tab="profile">
            <Businesslist businesses = {addedBusiness} update = {true} />
          </CTabPane>
        </CTabContent>
      </CTabs>
    </div>
  );
}