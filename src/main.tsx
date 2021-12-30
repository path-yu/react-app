import 'antd/dist/antd.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router } from 'react-router-dom'
import App from './App'
import './App.css'
import './index.css'
ReactDOM.render(
  <Router >
    <App />
  </Router>,
  document.getElementById('root')
)
