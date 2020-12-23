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

  return(
  <div>
    <BusinessAddForm history = {props.history}  />  
  </div>
  )
}