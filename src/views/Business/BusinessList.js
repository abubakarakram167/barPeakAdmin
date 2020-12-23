import {
 CRow,
 CCol,
 CContainer
} from '@coreui/react'
import Card from './BusinessCard'
import axios from 'axios';
import { useState, useEffect } from 'react';
export default (props) => {
  const { businesses } = props;
  return(
    <div>
      <CContainer>
        <CRow style = {{ marginTop: 10 }} >
          { businesses.length && businesses.map((business)=>{      
            return(
              <CCol xs="12" sm = "6" lg = "4" >
                <Card addCategorizeBusiness = {props.addCategorizeBusiness} history = {props.history} category = {props.category} showLink = {true} business = {business} update = { props.update }  />
              </CCol>
            );           
            })
          } 
        </CRow>
      </CContainer>
    </div>
  )
}