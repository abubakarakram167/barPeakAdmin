import {
  CRow,
  CCol,
  CContainer,
  CFormGroup,
  CLabel,
  CInput,
  CFormText,
  CForm,
  CTextarea,
  CButton
 } from '@coreui/react'
import axios from '../../api';
import AxiosApi from 'axios';
import { useState, useEffect } from 'react';
import { getUserData } from '../../localStorage';
import { Rating, Alert } from '@material-ui/lab';
import BusinessCard from '../Business/BusinessCard';
import _, { map } from 'underscore';
import { ToastContainer } from 'react-toastify';
import { MDBNotification } from "mdbreact";

export default (props) => {
  
  const [allCateogories, setCategories]=useState([]);
  const [isBar, setBar]=useState(false);
  const [formData, setFormData] = useState({});
  const [ratingData, setRatingData] = useState({});
  const [googleDetailData, setGoogleDetailData] = useState({});

  const onChange = (event) => {
    const { name, value } = event.target;
    if(value === "bar")
      setBar(true)
    else
      setBar(false)  
    setFormData(prevState => ({ ...prevState, [name]: value }));
  }

  
  const onChangeRating = (event) => {
    const { name, value } = event.target;
    setRatingData(prevState => ({ ...prevState, [name]: value }));
  }

  const submitForm = async () => {
    const { token } = await getUserData();
    const category = isBar ? formData.barCategory : formData.category;

    const body = {
      query:` 
      mutation{
        createBusiness(businessInput: {
            category: "${category}",
            title: "${formData.title}",
            placeId: "${props.placeId}}",
            ageInterval: "${formData.ageInterval}"
            rating:{
              fun: ${ratingData.fun}
              crowd: ${ ratingData.crowd }
              girlToGuyRatio: ${ratingData.girlToGuyRatio}
              difficultyGettingIn: ${ratingData.difficultyGettingIn}
              difficultyGettingDrink : ${ratingData.difficultyGettingDrink}
            }
            longDescription: "${formData.longDescription}",
            shortDescription: "${ formData.shortDescription}"
    
        })
        {
          title
        }
      }`
    }
    try{
      const res = await axios.post(`graphql?`,body,{ headers: {
        'Authorization': `Bearer ${token}`
      } })
      if(res.data.data.createBusiness){

      } 
      console.log("the response after getting business", res); 
    }catch(err){
      if(err.response.data){
        console.log("the error", err.data.errors.length)
      }
      console.log("the error below", err)
      
    }

  }
  

  useEffect(() => {
    const fetchData = async() => {
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
      try{
        const res = await axios.post(`graphql?`,body,{ headers: {
          'Authorization': `Bearer ${token}`
        } });
        const getSingleData = await axios.get(`http://localhost:3000/getSinglePlaceResult?place_id=${props.placeId}`);
        // console.log("the google detail data", getSingleData)
        const allSpecificCategories = res.data.data.getCategories
        setGoogleDetailData(getSingleData.data)
        setCategories(allSpecificCategories);
      }catch(err){
        console.log("the error", err);
      }
    }
    fetchData();
  }, []);

     console.log("the google detail data", googleDetailData)
  // console.log("form Data", formData)
  // console.log("the rating Data", ratingData);

  return(
    <div>
      
      <CContainer style = {{ width: "50%" }}  >
        <CRow>
          <MDBNotification
            show = {true}
            fade
            autohide = {3000}
            icon="envelope"
            iconClassName="green-text"
            title="Success"
            message="Business Sccessfull Added"
            text="1min ago"
          />
        </CRow>
        <CRow>
          <CCol sm = "12" >
            { !_.isEmpty(googleDetailData) &&
              <BusinessCard showLink = {false}  business = {googleDetailData} /> 
            } 
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="12">
            <CForm onSubmit={submitForm} >
              <CFormGroup>
                <CLabel htmlFor="nf-email">Title</CLabel>
                <CInput
                  type="text"
                  id="title"
                  name="title"
                  required
                  placeholder="Enter title.."
                  defaultValue = {googleDetailData["name"]}
                  value = { formData.title }
                  onChange = { onChange }
                />
                <CFormText className="help-block">Please enter your Title</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel htmlFor="nf-password">Short Description</CLabel>
                <CTextarea
                  name="shortDescription"
                  placeholder="Enter Short Description."
                  onChange = { onChange }
                  value = { formData.shortDescription }
                  rows = "2"
                />
                <CFormText className="help-block">Please enter Short Description</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel htmlFor="nf-password">Long Description</CLabel>
                <CTextarea
                  name="longDescription"
                  placeholder="Enter Long Description."
                  onChange = { onChange }
                  value = {formData.longDescription}
                  size = "large"
                  rows = "5"
                  cols = "40"
                />
                <CFormText className="help-block">Please enter Long Description</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel >Category</CLabel>
                <select 
                  onChange = {onChange}
                  name = "category" 
                  style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }} 
                >
                  { allCateogories.map((category)=>{
                      if(category.type === "main_category"){
                        return(
                          <option value = {category._id}>{ category.title }</option>
                        );
                      }  
                    })
                  }
                </select>
                <CFormText className="help-block">Please Select Category</CFormText>
              </CFormGroup>
              { isBar &&
                (<CFormGroup>
                  <CLabel >Bar Category</CLabel>
                  <select 
                    onChange = { onChange } 
                    name = "barCategory"
                    style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }} 
                  >
                    { allCateogories.map((category)=>{
                        if(category.type === "sub_bar"){
                          return(
                            <option value = {category._id}>{ category.title }</option>
                          );
                        }  
                      })
                    }
                  </select>
                  <CFormText className="help-block">Please Select Bar Category</CFormText>
                </CFormGroup>)
              }
              <CFormGroup>
                <CLabel >AgeInterval</CLabel>
                <select 
                  onChange = {onChange } 
                  name = "ageInterval"
                  style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }} 
                >
                  <option selected value="young">21-25</option>
                  <option value="elder">26-40</option>
                  <option value="all">All</option>
                </select>
                <CFormText className="help-block">Please Select Age</CFormText>
              </CFormGroup>
              <p style = {{ fontSize: 20 }} >Rating:</p>
              <CFormGroup>
                <CLabel style = {{ fontSize: 20 }} > Fun :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name="fun" defaultValue={2.6} onChange = { onChangeRating } size="large" precision = {0.1} max = {10} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} > { ratingData.fun } </span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > Crowd :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name="crowd" defaultValue={2.6} onChange = {onChangeRating } size="large" precision = {0.1} max = {10} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.crowd }</span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > girlToGuyRatio :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name="girlToGuyRatio" defaultValue={2.6} onChange = {onChangeRating} size="large" precision = {0.1} max = {10} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.girlToGuyRatio }</span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > difficultyGettingIn :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name = "difficultyGettingIn" defaultValue={2.6} onChange = {onChangeRating} size="large" precision = {0.1} max = {10} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.difficultyGettingIn }</span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > difficultyGettingDrink :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name = "difficultyGettingDrink" defaultValue={2.6} onChange = {onChangeRating} size="large" precision = {0.1} max = {10} />
                </span>  
                <span style = {{ marginLeft: 10, fontSize: 20 }} > { ratingData.difficultyGettingDrink } </span>   
              </CFormGroup>
            </CForm>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
          <CButton
            style = {{ marginTop: 100, marginBottom: 50 }}
            color = "info"
            onClick = {()=>{ submitForm()  }}
          >
            ADD Restaurant
          </CButton>
          {/* <input type = "submit" />    */}
          </CCol>
        </CRow>
      </CContainer>    
    </div>
  );
}