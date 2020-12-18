import {
  CTabs,
  CNav,
  CNavItem,
  CNavLink,
  CTabPane,
  CTabContent,
  CRow,
  CCol

} from '@coreui/react'
import Businesslist from './BusinessList';
import { useState, useEffect } from 'react';
import axiosApi from 'axios';
import axios from '../../api';
import { getUserData } from '../../localStorage';
import { Radio } from 'antd';
import './business.css'
import Category from '../Category/Category';
import Loader from 'react-loader-spinner'
import SearchField from "react-search-field";
import Pagination from '../../components/Pagination';

export default (props) => {  
  const [showNotAddedLoader, setShowNotAddedLoader] = useState(false);
  const [showAddedLoader, setShowAddedLoader] = useState(false);
  const [showCategorizeLoader, setShowCategorizeLoader] = useState(false);
  const [addedBusiness, setAddedBusinesses]=useState([]);
  const [notAddedBusiness, setNotAddedBusiness] = useState([]);
  const [notCategorize, setNotCategorize] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setCategory] = useState('');
  const [searchValue, setSearchValue] = useState('');
  //For Testing
 
  const onChange = e => {
    setCategory(e.target.value);
    const specificCategory = categories.filter( category => category._id === e.target.value )[0]._id;
    requestAddedBusiness(1, specificCategory)
  };

  const getAllBusinessCategories = (categories, isBar) =>{
    if(isBar){
      return categories.map((category)=>{
        return category.type;
      })
    }
    else{
      return categories.map((category)=>{
        return category.title;
      })
    }
    
  }
 
  const getAllBusiness = async(pageNumber, added, filter) => {
    console.log(`the page no ${pageNumber} and filter: ${filter} and added: ${added}`)
    try{ 
      const { token } = await getUserData();
      const body = {
        query:`
          query{
            getAllBusiness(filterInput: { pageNo: ${pageNumber}, filter: "${filter}", added: ${added} }){
            _id
            placeId
            category{
                title
                _id
            }    
            name
            rating{
                fun,
                crowd,
                ratioInput,
                difficultyGettingIn,
                difficultyGettingDrink
            }
            name
            totalUserCountRating
            ageInterval
            ratioType
            customData{
              address
              phoneNumber
              rating
            }
            uploadedPhotos{
                secure_url
            }
            googleBusiness{
              formatted_address
              formatted_phone_number
              name
              place_id
              user_ratings_total
              rating
              url
              types
            }
            }}
          `
      }
      
      const getAllBusiness = await axios.post(`graphql?`,body,{ headers: {
        'Authorization': `Bearer ${token}`
      } });
      
      return getAllBusiness.data.data.getAllBusiness;

    }catch(err){
      console.log("the error", err.response)
    }  
  }

  useEffect(() => {
    const fetchData = async()=>{
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
        console.log("the categories", res.data.data.getCategories)
        
        setCategories(res.data.data.getCategories)
        const allCategories = res.data.data.getCategories.filter(category => category.type === "main_category")[0]
        console.log("the all categories", allCategories)
        setCategory(allCategories._id)  
        // setCategoryId(res.data.data.getCategories[0]._id)

       requestNotAddedBusiness(1);
       requestAddedBusiness(1, allCategories._id);
       requestNotCategorize(1)
       
      }catch(err){
        console.log("the roor", err)
      }  
    }
    fetchData();
  }, []);

  const makeSearch = async(added, filter) =>{
    console.log(`the search Text ${searchValue}`)
    try{ 
      const { token } = await getUserData();
      const body = {
        query:`
        query{
          getSearchResults(searchInput: { searchValue: "${searchValue}", filter: "${filter}", added: ${added} }){
          _id
          placeId
          category{
              title
              _id
          }    
          name
          rating{
              fun,
              crowd,
              ratioInput,
              difficultyGettingIn,
              difficultyGettingDrink
          }
           name
           totalUserCountRating
           ageInterval
           ratioType
           customData{
             address
             phoneNumber
             rating
           }
           uploadedPhotos{
               secure_url
           }
           googleBusiness{
              formatted_address
              formatted_phone_number
              name
              place_id
              user_ratings_total
              rating
              url
              types
           }
          }}
          `
      }
      
      const getAllBusiness = await axios.post(`graphql?`,body,{ headers: {
        'Authorization': `Bearer ${token}`
      } });
      
      return getAllBusiness.data.data.getSearchResults;

    }catch(err){
      console.log("the error", err.response)
    }  
  }

  const getSearchResults = async(tab) =>{
  
    if(tab === 'notAdded'){
      setShowNotAddedLoader(true)
      const searchResults = await makeSearch(false, 'not')
      setNotAddedBusiness(searchResults)
      setShowNotAddedLoader(false)
    }
    else if(tab === 'added'){
      setShowAddedLoader(true)
      const searchResults = await makeSearch(true, 'allCategorySearch')
      setAddedBusinesses(searchResults)
      setShowAddedLoader(false)
    }
    else if(tab === 'notCategorize'){
      setShowCategorizeLoader(true)
      const searchResults = await makeSearch(true, 'not')
      setNotCategorize(searchResults)
      setShowCategorizeLoader(false)
    }



  }

  const requestNotAddedBusiness = async(pageNumber) => {
    setShowNotAddedLoader(true)
    const notAddedBusiness = await getAllBusiness(pageNumber, false, 'not');
    setShowNotAddedLoader(false)
    setNotAddedBusiness(notAddedBusiness)
  }

  const requestAddedBusiness = async(pageNumber, selectedCategory) => {
    setShowAddedLoader(true)
    const addedBusiness = await getAllBusiness(pageNumber, true, selectedCategory);
    setShowAddedLoader(false)
    setAddedBusinesses(addedBusiness)
  }

  const requestNotCategorize = async(pageNumber) => {
    setShowCategorizeLoader(true)
    const addedBusiness = await getAllBusiness(pageNumber, true, 'not');
    setNotCategorize(addedBusiness)
    setShowCategorizeLoader(false)
  }
  
  const changeSearchValue = async(e, currentCase) => {
    if(e === ''){
      console.log("in iff")
      if(currentCase === 'notAdded')
        requestNotAddedBusiness(1);
      else if(currentCase === 'added'){ 
        requestAddedBusiness(1, selectedCategory);
      }
      else if(currentCase === 'notCategorize')
        requestNotCategorize(1)
    }
    setSearchValue(e)
  }

  return (
    <div>
      <CTabs activeTab="addBusiness">
        <CNav variant="tabs">
          <CNavItem>
            <CNavLink data-tab="addBusiness">
              ADD Business
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink data-tab="recentlyAdded">
              Recently ADDED
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink data-tab="notCategorize">
              Not Categorize
            </CNavLink>
          </CNavItem>
        </CNav>
        <CTabContent>
          <CTabPane data-tab="addBusiness">
          <CRow className = "search-bar" >
            <CCol xs = {12} style = {{ textAlign: 'center', marginTop: 40 }} >
              <SearchField
                placeholder="Search "
                onChange={ (e)=> { changeSearchValue(e, 'notAdded')} }
                className="search-bar-input"
                onSearchClick = { ()=> {  getSearchResults('notAdded') } }
              />
            </CCol>
          </CRow>
            { showNotAddedLoader ?
            ( <Loader
              type="Oval"
              color="gray"
              height={60}
              width={60}
              style = {{textAlign: 'center'}}
            /> ) :
            <div>        
              <Businesslist  
                businesses = {notAddedBusiness} 
                update = {false} 
              />
            </div>
            }
            <div className = "pagination-style" >
              < Pagination onChange = { (pageNumber)=>{ 
                requestNotAddedBusiness(pageNumber)
              } } />
            </div>    
          </CTabPane>
          <CTabPane data-tab="recentlyAdded">
          <CRow className = "search-bar" >
            <CCol xs = {12} style = {{ textAlign: 'center', marginTop: 40 }} >
              <SearchField
                placeholder="Search "
                onChange={ (e)=> { changeSearchValue(e, 'added')} }
                classNames="test-class"
                onSearchClick = { ()=> {  getSearchResults('added') } }
              />
            </CCol>
          </CRow>
          { showAddedLoader ?
            ( <Loader
              type="Oval"
              color="gray"
              height={60}
              width={60}
              style = {{textAlign: 'center'}}
            /> ) :
            <div>
              <CRow className = "search-bar" >
                <CCol className = "business-type-container" sm = {12} >
                  <div className = "business-type-text" >What you want to ADD ?</div>  
                  <Radio.Group onChange={onChange} value={selectedCategory}>
                    { categories.map((category)=>{
                        if(category.type === "main_category"){
                          return(
                            <Radio value={category._id}>{ category.title }</Radio>
                          )
                        }
                      }) 
                    }
                  </Radio.Group>
                </CCol>
              </CRow>
              <Businesslist  
                businesses = {addedBusiness} 
                update = {false}
                category = {selectedCategory} 
              />
            </div>
            }
            <div className = "pagination-style" >
              < Pagination onChange = { (pageNumber)=>{ 
                requestAddedBusiness(pageNumber, selectedCategory)
              } } />
            </div>    
          </CTabPane>
          <CTabPane data-tab="notCategorize">
          <CRow>
            <CCol xs = {12} style = {{ textAlign: 'center', marginTop: 40 }} >
              <SearchField
                placeholder="Search "
                onChange={ (e)=> { changeSearchValue(e, 'notCategorize')} }
                classNames="test-class"
                onSearchClick = { ()=> {  getSearchResults('notCategorize') } }
              />
            </CCol>
          </CRow>
          { showCategorizeLoader ?
            ( <Loader
              type="Oval"
              color="gray"
              height={60}
              width={60}
              style = {{textAlign: 'center'}}
            /> ) :
            <div>  
              <div> 
                <Businesslist history = {props.history} businesses = {notCategorize} update = {true} />
              </div>
            </div>  
          }
          <div className = "pagination-style" >
            < Pagination onChange = { (pageNumber)=>{ 
              requestNotCategorize(pageNumber)
            } } />
          </div>
          </CTabPane>
        </CTabContent>
      </CTabs>
    </div>
  );
}