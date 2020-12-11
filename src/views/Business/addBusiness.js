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

  const {place_id, category_id, auto_submit} = props.match.params
  return(
  <div>
    <BusinessAddForm placeId = { place_id } autoSubmit = {auto_submit} categoryId = { category_id } history = {props.history}  />  
  </div>
  )
}