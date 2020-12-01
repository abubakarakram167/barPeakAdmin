import {
  CRow,
  CCol,
  CContainer
 } from '@coreui/react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import BusinessEditForm from "../Forms/UpdateBusinessForm";
export default (props) => {
  console.log("props", props)
  const {place_id} = props.match.params
  return(
  <div>
    <BusinessEditForm placeId = { place_id }  history = {props.history} />  
  </div>
  )
}