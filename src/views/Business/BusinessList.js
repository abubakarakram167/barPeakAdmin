import {
 CRow,
 CCol,
 CContainer
} from '@coreui/react'
import Card from './BusinessCard'
import axios from 'axios';
import { useState, useEffect } from 'react';
export default (props) => {
  

  // console.log("the data", allBusinesses);
  const { businesses } = props;
  return(
    <div>
      <CContainer>
        <CRow style = {{ marginTop: 10 }} >
          { businesses.length && businesses.map((business)=>{
              if(business.business_status === "OPERATIONAL"){
              return(
                <CCol sm="4" >
                  <Card history = {props.history} category = {props.category} showLink = {true} business = {business} update = { props.update }  />
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