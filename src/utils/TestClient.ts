import * as rp from 'request-promise'

export class TestClient {
  url: string;

  options: {
    jar: any;
    withCredentials: boolean;
    json: boolean;
  }
  constructor(url: string) {
    this.url = url
    this.options = {
      jar: rp.jar(),
      withCredentials: true,
      json: true
    }
  }

  async forgotPasswordChange(newPassword: string, key: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            forgotPasswordChange(newPassword: "${newPassword}", key: "${key}") {
              path
              message
            }
          }
        `
      }
    });
  }

  async me() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          {
            me {
              email
            }
          }
        `
      }
    })
  }

  async logout() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            logout
          }
        `
      }
    })
  }

  async login(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            login(email: "${email}", password: "${password}") {
              path
              message
            }
          }
        `
      }
    })
  }
}
