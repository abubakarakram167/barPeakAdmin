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

 export default (props) => {

  const { category } = props;
  console.log("here the props for category", props);

   return(
     <div>
      <CCard>
        <CCardBody>
          <CCardTitle style = {{ height: 20 }} >
            {category.title}
          </CCardTitle>
          <img 
            src={category.imageUrl}
            alt="new"
            style = {{ width: "100%", height: 200, position: 'relative' }}
          />  
          <CCardText>
          </CCardText>
        </CCardBody>
      </CCard>
     </div>
   )
 }