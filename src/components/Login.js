import React, { Component } from 'react'
import { login, resetPassword, getUserMobileNumber } from '../helpers/auth'
import { Button, Label } from 'semantic-ui-react'


function setErrorMsg(error) {
  return {
    loginMessage: error
  }
}

export default class Login extends Component {
  state = { loginMessage: null }
  handleSubmit = (e) => {
    e.preventDefault()
    login(this.email.value, this.pw.value)
      .then((data) => {
        getUserMobileNumber(data.uid)
      })
      .catch((error) => {
        this.setState(setErrorMsg('Invalid username/password.'))
      })
  }
  resetPassword = () => {
    resetPassword(this.email.value)
      .then(() => this.setState(setErrorMsg(`Password reset email sent to ${this.email.value}.`)))
      .catch((error) => this.setState(setErrorMsg(`Email address not found.`)))
  }
  render () {
    return (
      <div className="col-sm-6 col-sm-offset-3 loginForm">
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <Label>EMAIL</Label>
            <input className="form-control" ref={(email) => this.email = email} placeholder="you@company.com"/>
          </div>
          <div className="form-group">
            <Label>PASSWORD</Label>
            <input type="password" className="form-control" placeholder="********" ref={(pw) => this.pw = pw} />
          </div>
          {
            this.state.loginMessage &&
            <div className="alert alert-danger" role="alert">
              <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
              <span className="sr-only">Error:</span>
              &nbsp;{this.state.loginMessage} <a href="#" onClick={this.resetPassword} className="alert-link">Forgot Password?</a>
            </div>
          }
          <Button primary fluid type="submit" className="btn btn-primary">Login</Button>
        </form>
      </div>
    )
  }
}
