import {
  CTabs,
  CNav,
  CNavItem,
  CNavLink,
  CTabPane,
  CTabContent,
  CRow,
  CCol

} from '@coreui/react'
import Businesslist from './BusinessList';
import { useState, useEffect } from 'react';
import axiosApi from 'axios';
import axios from '../../api';
import { getUserData } from '../../localStorage';
import { Radio } from 'antd';
import './business.css'
import Category from '../Category/Category';

export default () => {  
  const [addedBusiness, setAddedBusinesses]=useState([]);
  const [notAddedBusiness, setNotAddedBusiness] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setCategory] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  //For Testing
 
  const onChange = e => {
    setCategory(e.target.value);
    getAllBusinesses(e.target.value, latitude, longitude)
  };

 

  const getAllBusinesses = async(businessType, latitude, longitude) => {
    try{ 
      console.log("Latitude ", latitude);
      console.log("Longitude is :", longitude);
       //For testing
       latitude = 32.7970465;
       longitude = -117.2545220;
      let radius = 10000;
      const res = await axiosApi.get(`http://localhost:3000/getGoogleMapsResults?business_type=${businessType}&lat=${latitude}&lon=${longitude}&radius=${radius}`);

      const { token } = await getUserData();
      const body = {
        query:`
        query{
          allBusinesses{
            placeId,
            category{
              title,
              type
            }       
          }
        }
        `
      }
      
      const getAllBusiness = await axios.post(`graphql?`,body,{ headers: {
        'Authorization': `Bearer ${token}`
      } });

      const alreadyAddedBusiness = getAllBusiness.data.data.allBusinesses
      console.log("already Added Business", alreadyAddedBusiness);
      console.log("selected Category", businessType);
      let alreadyBusinessIds;
      const allBusinessIdsForNot = alreadyAddedBusiness.map( business => business.placeId);
      if(businessType === 'bar'){
        alreadyBusinessIds= alreadyAddedBusiness
                            .filter(business => "sub_bar" === business.category.type )
                            .map(business => business.placeId)
      }
      else{
        alreadyBusinessIds = alreadyAddedBusiness
                              .filter(business => businessType === business.category.title )
                              .map(business => business.placeId)
      }
      console.log("the already business ids", alreadyBusinessIds);

      const googleAlreadyAddedBusiness = res.data.filter((business)=>{
        return(alreadyBusinessIds.includes(business.place_id));
      })
      
      const notgoogleAlreadyAddedBusiness = res.data.filter((business)=>{
        if(allBusinessIdsForNot.includes(business.place_id))
          return false;
        return true
      })
      

      setAddedBusinesses(googleAlreadyAddedBusiness);
      setNotAddedBusiness(notgoogleAlreadyAddedBusiness);

      console.log("googleAlreadyAddedBusiness", googleAlreadyAddedBusiness);
      console.log("notggogleAlreadyAddedBusiness", notgoogleAlreadyAddedBusiness);

    }catch(err){
      console.log("the error", err)
    }  
  }

  useEffect(() => {
    const fetchData = async()=>{
      const { token } = await getUserData();
      const body = {
        query:`
        query{
          getCategories{
            title
            type
            imageUrl
            _id
          }
        }` 
      }
      try{
        const res = await axios.post(`graphql?`,body,{ headers: {
          'Authorization': `Bearer ${token}`
        } });
        setCategories(res.data.data.getCategories)
        setCategory(res.data.data.getCategories[0].title)
        
        navigator.geolocation.getCurrentPosition(function(position) {
            console.log("the inn", position)
           setLatitude(position.coords.latitude)
           setLongitude(position.coords.longitude)
          getAllBusinesses(res.data.data.getCategories[0].title, position.coords.latitude, position.coords.longitude)
        })

         
                
      }catch(err){
        console.log("the roor", err)
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
        <CRow>
          <CCol className = "business-type-container" sm = {12} >
          <div className = "business-type-text" >What are you trying to ADD ?</div>  
          <Radio.Group onChange={onChange} value={selectedCategory}>
            { categories.map((category)=>{
                if(category.type === "main_category"){
                  return(
                    <Radio value={category.title}>{ category.title }</Radio>
                  )
                }
              }) 
            }
          </Radio.Group>
          </CCol>
        </CRow>
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