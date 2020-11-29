import {
  CRow,
  CCol,
  CContainer
 } from '@coreui/react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import BusinessAddForm from "../Forms/AddBusinessForm";
export default (props) => {


useEffect(() => {

}, []);

  const {place_id} = props.match.params
  return(
  <div>
    <BusinessAddForm placeId = { place_id }  />  
  </div>
  )
}