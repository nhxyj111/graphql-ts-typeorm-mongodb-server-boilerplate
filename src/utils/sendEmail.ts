import * as SparkPost from 'sparkpost';

const client = new SparkPost(process.env.SPARKPOST_API_KEY)

export const sendEmail = async (recipient: string, url: string) => {
  const response = await client.transmissions.send({
    options: {
      sandbox: true
    },
    content: {
      from: 'test@test.com',
      subject: 'Confirm Email',
      html:
        `<html>
          <body>
            <a href="${url}">confirm email</a>
          </body>
        </html>`
    },
    recipients: [{ address: recipient }]
  })
  console.log(response)
}
