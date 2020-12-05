import {
  CCard,
  CCardHeader,
  CCardTitle,
  CCardSubtitle,
  CCardBody,
  CCardText,
  CCardImg,
  CRow,
  CCol,
  CButton
 } from '@coreui/react'
 import { useState, useEffect } from 'react';
import axios from '../../api';
import { getUserData } from '../../localStorage';
import InputNumber from 'react-input-number';
import Modal from '../../components/Modal';
import './user.css'
const milesArray = [0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9];

 export default (props) => {
  const [radius, setRadius] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(true); 
  
  const getMilesintoMeters = (miles)=>{
    return miles * 1609;
  }
  const getMetersIntoMiles = (meters)=>{
    return meters/1609;
  }

  const submitRadius = async() => {
    const { token } = await getUserData();
    console.log("the radius to be submit", parseInt(getMilesintoMeters(radius)))
    const body = {
      query:`
      mutation{
        updateRadius(radius: ${ parseInt(getMilesintoMeters(radius))}){
            firstName
            radius
            lastName
            email
            dob
        }
      }
      `
    }
    try{  
      const res = await axios.post(`graphql?`,body,{ headers: {
        'Authorization': `Bearer ${token}`
      } });
      if(res.data.data.updateRadius.radius)
        setShowPopup(true)
    }catch(error){

    }
  }

  useEffect(() => {
    const fetchData = async()=>{
      const { token } = getUserData();
      const body = {
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
        // console.log("the user radius fetch", res.data.data.getUser.radius)
        // console.log("the radius converted",getMetersIntoMiles(res.data.data.getUser.radius) );
        // console.log("after round", Math.round(getMetersIntoMiles(res.data.data.getUser.radius) * 2) / 2)
        setRadius(Math.round(getMetersIntoMiles(res.data.data.getUser.radius) * 2) / 2)
      }catch(err){
        console.log("the roor", err)
      }  
    }
    fetchData();
  }, []);

   return(
    <div>
      <CRow>
        <CCol xs ={2}>
          Change Radius
        </CCol>
        <CCol  xs = {5} >
        <select
          style = {{ width: "30%" }}
          onChange={(e) => {
            setRadius(e.target.value)
            // console.log("the radius", getMilesintoMeters(radius))
            // console.log("again conversion", getMetersIntoMiles(getMilesintoMeters(radius)))
          }}
          value = {radius}
        >
         { milesArray.map((mile)=>{
            return(
              <option key ={mile} value={mile}>{mile}</option>
            )
         })
         }
        </select>
        </CCol>
        <CCol xs = {2}>
          Your Current Radius : {radius} miles
        </CCol>
      </CRow>
      <CRow>
        <CButton className = "update-radius" onClick = {()=>{ submitRadius() }} >
          Update
        </CButton>
      </CRow>
      <CRow>
        <Modal showPopup = {showPopup} success = {success} message = {"Radius Updated SuccessFully"} />
      </CRow>   
    </div>
   )
 }