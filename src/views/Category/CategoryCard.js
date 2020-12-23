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
 import { Link } from 'react-router-dom'
import './category.css';
import Category from './Category';
import { Popconfirm, message } from 'antd';
 import axios from '../../api';
 import { getUserData } from '../../localStorage';
 import Modal from '../../components/Modal';

 export default (props) => {

  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(true); 
  const { category } = props;

  const confirm = async (categoryId) =>{
    const { token } = await getUserData();
    const body = {
      query:` 
      mutation{
        deleteCategory(categoryId: "${categoryId}")
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
       
      console.log("the response after deleting", res);
    }catch(error){

    }
  }
  
  const cancel =(e) => {
    console.log(e);
    message.error('Click on No');
  }


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
            { props.main ?
            <Link className = "category-card" to={`categoryAdd/${category._id}`}>Edit</Link>
            :
            (<div className = "button-grid" >
              <div>
                <Link className = "business-card" to={`categoryAdd/${category._id}`}>Edit</Link>
              </div>
              {/* <div style = {{ marginTop: 10 }} >
              <Popconfirm
                title="Are you sure to delete this task?"
                onConfirm={() =>confirm(category._id)}
                onCancel={cancel}
                okText="Yes"
                cancelText="No"
              >
                <CButton className = "delete-button" >
                  Delete
                </CButton>
              </Popconfirm>
              <CRow>
                <Modal delete = {true} showPopup = {showPopup} success = {success} message = {"Category Deleted SuccessFully"} />
              </CRow>        
              </div> */}
            </div>)
          }  
          <CCardText>
          </CCardText>
        </CCardBody>
      </CCard>
     </div>
   )
 }