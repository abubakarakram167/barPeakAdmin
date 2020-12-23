import {
  CRow,
  CCol,
  CContainer,
  CButton
 } from '@coreui/react'
import { useState, useEffect } from 'react';
import axiosApi from 'axios';
import axios from '../../api';
import { getUserData } from '../../localStorage';
import Card from './CategoryCard'
import { Link } from 'react-router-dom'

export default () => {  
  const [allCateogories, setCategories]=useState([]);

  useEffect(() => {
    const fetchData = async()=>{
     try{ 
      const { token } = await getUserData();
      const body = {
        query:`
        query{
          getCategories{
            title
            type
            imageUrl
            _id
          }
        }` 
      }

      const res = await axios.post(`graphql?`,body,{ headers: {
        'Authorization': `Bearer ${token}`
      } });
      const allSpecificCategories = res.data.data.getCategories
      setCategories(allSpecificCategories)

     }catch(err){
       console.log("the error", err)
     }  
    }
    fetchData();
  }, []);


  return (
    <div>
      <CContainer>
      <span style = {{ fontSize: 30 }} >Main Categories</span>  
        <CRow style = {{ marginTop: 10 }} >
          { allCateogories.length && allCateogories.map((category)=>{
              if(category.type === "main_category"){
              return(
                <CCol sm="4" >
                  <Card main = {true} category = {category}   />
                </CCol>
              );
            }
            })
          } 
        </CRow>
        <CRow>
          <CCol xs  = {4} sm = {4}>
            <span style = {{ fontSize: 30 }} >Bar Categories</span> 
          </CCol>
          <CCol xs = {8} sm = {8} style = {{ textAlign: 'end' }} >
            <Link style = {{ position: 'relative', top: 20, color: 'white', padding: 20, paddingTop: 10, paddingBottom: 10,marginTop: 15, backgroundColor: '#77c2e6', fontSize: 14, fontWeight: 600 }} to={`categoryAdd/${null}`}>ADD</Link>
            {/* <CButton style = {{  backgroundColor: '#77c2e6', fontSize: 14, fontWeight: 600 }} > Add </CButton> */}
          </CCol>
        </CRow>
        <CRow style = {{ marginTop: 10 }} >
          { allCateogories.length && allCateogories.map((category)=>{
              if(category.type === "sub_bar"){
              return(
                <CCol sm="4" >
                  <Card main = {false} category = {category} />
                </CCol>
              );
            }
            })
          } 
        </CRow>
      </CContainer>
    </div>
  );
}