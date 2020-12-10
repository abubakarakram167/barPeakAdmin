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
 import { Popconfirm, message } from 'antd';
 import axios from '../../api';
 import { getUserData } from '../../localStorage';
 import Modal from '../../components/Modal';
 
 export default (props) => {
  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(true); 
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
  const confirm = async (placeId) =>{
    const { token } = await getUserData();
    const body = {
      query:` 
      mutation{
        deleteBusiness(placeId: "${placeId}")
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
  const { business, category } = props;
  console.log("the bussiness prop get", business)
  const photoUrl = business.photoReference ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${business.photoReference}&key=AIzaSyD9CLs9poEBtI_4CHd5Y8cSHklQPoCi6NM` : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/600px-No_image_available.svg.png";
   return(
     <div>
      <CCard>
        <CCardBody>
          <CCardTitle style = {{ height: 20 }} >
            {business.name}
          </CCardTitle>
          <img 
            src={photoUrl}
            alt="new"
            style = {{ width: "100%", height: 200, position: 'relative' }}
          />
          { props.showLink && !props.update &&
            <Link className = "business-card-add" to={`addBusiness/${business.placeId}/category/${category}`} >ADD</Link>
          } 

          {  props.showLink && props.update &&
            (<div className = "button-grid-business" >
              <div>
                <Link className = "business-card" to={`updateBusiness/${business.placeId}/category/${category}`}>Edit</Link>
              </div>
              <div style = {{ marginTop: 10 }} >
              <Popconfirm
                title="Are you sure to delete this task?"
                onConfirm={() =>confirm(business.placeId)}
                onCancel={cancel}
                okText="Yes"
                cancelText="No"
              >
                <CButton className = "delete-button" >
                  Delete
                </CButton>
              </Popconfirm>
              </div>
            </div>)
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
            
          
            <CRow>
              <CCol style = {{ marginTop: 7, fontSize: 16 }} sm = {4} >
                Rating: 
              </CCol>
              <CCol sm = {8} style = {{ marginTop: 3 }} >
                <ReactStars
                  count={5}
                  onChange={ratingChanged}
                  size={20}
                  value = {business.googleRating}
                  activeColor="#fcbe03"
                />
              </CCol>
            </CRow>
            <CRow style = {{ maxHeight: 80 }}>
              <CCol style = {{ marginTop: 0, fontSize: 16 }} sm = {4} >
                Vicinty: 
              </CCol>
              <CCol sm = {8} style = {{ marginTop: 3 }} >
                 <span>{business.address.substr(0,30) }</span>
              </CCol>
            </CRow>
            <CRow style = {{ minHeight: 80 }} >
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
                <span>{ renderDollars(business.priceLevel) }</span>
              </CCol>
            </CRow>
            <CRow>
              <Modal delete = {true} showPopup = {showPopup} success = {success} message = {"Business Deleted SuccessFully"} />
            </CRow>            
          
        </CCardBody>
      </CCard>
     </div>
   )
 }