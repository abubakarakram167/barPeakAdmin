import {
  CTabs,
  CNav,
  CNavItem,
  CNavLink,
  CTabPane,
  CTabContent

} from '@coreui/react'
import Businesslist from './BusinessList';
import { useState, useEffect } from 'react';
export default () => {
  const [Age, setAge] = useState(33);
  const [Somestate,setSomestate]=useState("okkk");
  useEffect(() => {
    console.log('the age is changed to ',Age);
  });

  return (
    <div>
      <CTabs activeTab="home">
        <CNav variant="tabs">
          <CNavItem>
            <CNavLink data-tab="home">
              ADD Business
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink data-tab="profile">
              Recently ADDED
            </CNavLink>
          </CNavItem>
        </CNav>
        <CTabContent>
          <CTabPane data-tab="home">
            <Businesslist />
          </CTabPane>
          <CTabPane data-tab="profile">
            456
          </CTabPane>
        </CTabContent>
      </CTabs>
    </div>
  );
}