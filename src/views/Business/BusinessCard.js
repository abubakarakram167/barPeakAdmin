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
 import { Link } from 'react-router-dom'
 import _, { map } from 'underscore';

 export default (props) => {

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
  const { business } = props;
  // console.log("here the props", props);
  console.log("the business", business)
   return(
     <div>{!_.isEmpty(business.photos) &&
      <CCard>
        <CCardBody>
          <CCardTitle style = {{ height: 20 }} >
            {business.name}
          </CCardTitle>
          <img 
            src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${business.photos[0].photo_reference}&key=AIzaSyD9CLs9poEBtI_4CHd5Y8cSHklQPoCi6NM`}
            alt="new"
            style = {{ width: "100%", height: 200, position: 'relative' }}
          />
          { props.showLink && !props.update ?
            <Link className = "business-card" to={`addBusiness/${business.place_id}`}>ADD</Link>
            : <Link className = "business-card" to={`updateBusiness/${business.place_id}`}>Edit</Link>
          }
          {/* <CButton
            className="m-2"
            color = 'primary'
            style = {{ position: 'absolute', left:130, top: 180}}
            onClick = {(business)=>{ 

            }}
          >
            ADD
          </CButton> */}
            
          <CCardText>
            <div>
              <CRow>
                <CCol style = {{ marginTop: 7, fontSize: 16 }} sm = {4} >
                  Rating: 
                </CCol>
                <CCol sm = {8} style = {{ marginTop: 3 }} >
                  <ReactStars
                    count={5}
                    onChange={ratingChanged}
                    size={20}
                    value = {business.rating}
                    activeColor="#fcbe03"
                  />
                </CCol>
              </CRow>
              <CRow>
                <CCol style = {{ marginTop: 0, fontSize: 16 }} sm = {4} >
                  Vicinty: 
                </CCol>
                <CCol sm = {8} style = {{ marginTop: 3 }} >
                  <span>{business.vicinity}</span>
                </CCol>
              </CRow>
              <CRow>
                <CCol style = {{ marginTop: 0, fontSize: 16 }} sm = {4} >
                  Types : 
                </CCol>
                <CCol sm = {8} style = {{ marginTop: 3 }} >
                  { business.types.map((business)=>{
                      return (
                        <span>{ business},</span>
                      )
                    })

                  }
                  
                </CCol>
              </CRow>
              <CRow>
                <CCol style = {{ marginTop: 0, fontSize: 16 }} sm = {5} >
                  Price Level: 
                </CCol>
                <CCol sm = {7} style = {{ marginTop: 3 }} >
                  <span>{ renderDollars(business.price_level) }</span>
                </CCol>
              </CRow>      
            </div>
          </CCardText>
        </CCardBody>
      </CCard>}
     </div>
   )
 }