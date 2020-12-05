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
import Loader from 'react-loader-spinner'

export default (props) => {  
  const [showLoader, setShowLoader] = useState(false);
  const [addedBusiness, setAddedBusinesses]=useState([]);
  const [notAddedBusiness, setNotAddedBusiness] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setCategory] = useState('');
  const [selectedCategoryId, setCategoryId] = useState('')
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('');
  //For Testing
 
  const onChange = e => {
    setCategory(e.target.value);
    const specificCategory = categories.filter( category => category.title === e.target.value )[0]._id;
    setCategoryId(specificCategory)
    getAllBusinesses(e.target.value, latitude, longitude, radius)
  };
 
   

  const getAllBusinesses = async(businessType, latitude, longitude, radius) => {
    try{ 
      console.log("Latitude ", latitude.toFixed(4));
      console.log("Longitude is :", longitude.toFixed(4));
      //For testing
      // latitude =   32.7970465;
      // longitude =  -117.2545220;
      // radius = 2000;
      setShowLoader(true)
      console.log(`the latittude ${latitude.toFixed(4)} and longitude ${longitude.toFixed(4)} and radius is ${radius} and place is ${businessType} `)
      const res = await axios.get(`getGoogleMapsResults?business_type=${businessType}&lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}&radius=${radius}`);
      
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
    
      const googleAlreadyAddedBusiness = res.data.filter((business)=>{
        return(alreadyBusinessIds.includes(business.place_id));
      })
      
      const notgoogleAlreadyAddedBusiness = res.data.filter((business)=>{
        if(allBusinessIdsForNot.includes(business.place_id))
          return false;
        return true
      })
      
      setShowLoader(false)
      setAddedBusinesses(googleAlreadyAddedBusiness);
      setNotAddedBusiness(notgoogleAlreadyAddedBusiness);

    }catch(err){
      console.log("the error", err.response)
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
      const userBody = {
        query:`
          query{
            getUser{
                _id
                firstName
                lastName
                email
                dob
                radius
            }
          }
        ` 
      }
      try{
        const res = await axios.post(`graphql?`,body,{ headers: {
          'Authorization': `Bearer ${token}`
        } });
        const user = await axios.post(`graphql?`,userBody,{ headers: {
          'Authorization': `Bearer ${token}`
        } });
  
        const radius = user.data.data.getUser.radius;
        setRadius(radius)
        setCategories(res.data.data.getCategories)
        setCategory(res.data.data.getCategories[0].title)
        setCategoryId(res.data.data.getCategories[0]._id)
        navigator.geolocation.getCurrentPosition(function(position) { 
          setLatitude(position.coords.latitude)
          setLongitude(position.coords.longitude)
          getAllBusinesses(res.data.data.getCategories[0].title, position.coords.latitude, position.coords.longitude, radius)
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
            { showLoader ?
            ( <Loader
              type="Oval"
              color="gray"
              height={60}
              width={60}
              style = {{textAlign: 'center'}}
            /> ) :
            (<Businesslist  
              businesses = {notAddedBusiness} 
              update = {false}
              category = {selectedCategoryId} 
            />)
            
            }
          </CTabPane>
          <CTabPane data-tab="profile">
          { showLoader ?
            ( <Loader
              type="Oval"
              color="gray"
              height={60}
              width={60}
              style = {{textAlign: 'center'}}
            /> ) : 
            <Businesslist history = {props.history} businesses = {addedBusiness} update = {true} />
          }
          </CTabPane>
        </CTabContent>
      </CTabs>
    </div>
  );
}