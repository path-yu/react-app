import 'normalize.css'
import React from 'react'
import { Route, Switch } from 'react-router'
import LayOut from './components/LayOut'
import Calculator from './page/calculator/Calculator'
import Home from './page/Home'
import Renju from './page/renju/renju'
import Task from './page/Task/Task'
import TodoList from './page/todolist/TodoList'
import './style/_animate.scss'
function App() {
  return (
    <LayOut>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route exact path="/task" component={Task}/>
        <Route exact path="/calculator" component={Calculator}/>
        <Route exact path="/todoList" component={TodoList}/>
        <Route exact path="/renju" component={Renju}/>
      </Switch>
    </LayOut>
  );
}

export default App
