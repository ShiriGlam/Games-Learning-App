import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import {jwtDecode} from 'jwt-decode'; // Import jwtDecode to decode the JWT token
import './Home.css';
import SearchBar from './SearchBar';
import RecommendationsMenu from './RecommendationsMenu';
import UserSets from './UserSets';
import ProgressList from './ProgressList';

const Home = () => {



  return (
    <div className="home-page">
      <div className="navbar">
        <SearchBar />
      </div>
      <div className="container-home">
        <RecommendationsMenu />
        <UserSets />
        <ProgressList />
      </div>
    </div>
  );
};

export default Home;


