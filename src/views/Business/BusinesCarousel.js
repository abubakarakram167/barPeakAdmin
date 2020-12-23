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
 import ReactStars from "react-rating-stars-component";
 import { useState, useEffect } from 'react';
 import _, { map } from 'underscore';
 import { Popconfirm, message } from 'antd';
 import axios from '../../api';
 import { getUserData } from '../../localStorage';
 import Modal from '../../components/Modal';
import "react-responsive-carousel/lib/styles/carousel.min.css"; 
import Carousel from '../../components/Carousel';

 export default (props) => {
  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(true); 
  const ratingChanged = (newRating) => {
    console.log(newRating);
  };

  const renderDollars = (level) =>{
    let dollars = ''
    for (let i =0; i < level; i++ ){
      dollars = dollars + "$"
    }
    return dollars;
  }
  const confirm = async (placeId) =>{
    const { token } = await getUserData();
    const body = {
      query:` 
      mutation{
        deleteBusiness(placeId: "${placeId}")
      }
      `
    }
    try{
      const res = await axios.post(`graphql?`,body,{ headers: {
        'Authorization': `Bearer ${token}`
      } })
      if(res){
        setShowPopup(true)
      }
    }catch(error){

    }
  }
  
  const cancel =(e) => {
    console.log(e);
    message.error('Click on No');
  }
  
  const { business, category } = props;

  let updatedData = { };
  if(business.googleBusiness){
    updatedData.address = business.googleBusiness.formatted_address;
    updatedData.rating = business.googleBusiness.rating;
    updatedData.phoneNo = business.googleBusiness.formatted_phone_number
  }
  else{
    updatedData.address = business.customData.address;
    updatedData.rating = business.customData.rating;
    updatedData.phoneNo = business.customData.phoneNo;
  }

  const allPhotos = business.uploadedPhotos.length>0 && business.uploadedPhotos[0].secure_url ? business.uploadedPhotos: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png"
  
    return(
     <div>
      <CCard>
        <CCardBody>
          <CCardTitle style = {{ height: 20 }} >
            {business.name}
          </CCardTitle>
            <CRow>
              <Carousel style = {{ display: "block" }} photos = {allPhotos} />
            </CRow>
             <CRow>
              <CCol style = {{ marginTop: 7, fontSize: 16 }} xs = {4} >
                Rating: 
              </CCol>
              <CCol xs = {6} style = {{ marginTop: 3 }} >
                <ReactStars
                  count={5}
                  onChange={ratingChanged}
                  size={20}
                  value = {updatedData.rating}
                  activeColor="#fcbe03"
                />
              </CCol>
            </CRow>
            <CRow style = {{ maxHeight: 80, minHeight: 80 }}>
              <CCol style = {{ marginTop: 0, fontSize: 16 }} xs = {4} >
                Address: 
              </CCol>
              <CCol xs = {6} style = {{ marginTop: 3 }} >
                 <span>{updatedData.address }</span>
              </CCol>
            </CRow>
            <CRow style = {{ minHeight: 80 }} >
              <CCol style = {{ marginTop: 0, fontSize: 16 }} xs = {4} >
                Types : 
              </CCol>
              <CCol xs = {6} style = {{ marginTop: 3 }} >
                { category.length > 0 && !category.includes(null) ? category.map((category)=>{
                    return (
                      <span>{ category.title},</span>
                    )
                  }) : business.googleBusiness.types.slice(0,3).map((business)=> {
                    return (
                      <span>{ business},</span>
                    )
                  })

                }
                
              </CCol>
            </CRow>
            <CRow>
              <CCol style = {{ marginTop: 0, fontSize: 16 }} xs = {4} >
                Phone no: 
              </CCol>
              <CCol xs = {7} style = {{ marginTop: 3 }} >
                <span>{ updatedData.phoneNo }</span>
              </CCol>
            </CRow>
            <CRow>
              <Modal delete = {true} showPopup = {showPopup} success = {success} message = {"Business Deleted SuccessFully"} />
            </CRow>            
          
        </CCardBody>
      </CCard>
     </div>
   )
 }