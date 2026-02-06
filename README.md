# Student Records Web Application – AWS Deployment

## 📘 Overview

This project is a proof-of-concept deployment of a highly available, scalable, and secure student records web application using AWS. Developed as part of the AWS Academy capstone project, the solution addresses performance and availability concerns during peak admissions periods at a fictional university.

---
## Architecture Overview

The following diagram illustrates the high-level architecture of the student records web application deployed on AWS:

![Architecture Diagram](https://github.com/Clinton-dev/xyz-uni-web-app/blob/main/xzy%20uni.drawio%20(3).png)

![Screenshot from 2025-06-25 15-13-46](https://github.com/user-attachments/assets/d90791b8-4678-437b-9524-458f9bed1e93)

![Screenshot from 2025-06-25 15-14-01](https://github.com/user-attachments/assets/c6a5408d-8e22-416f-aa66-dc3da18f6983)

---

## 🏗 Architecture Summary

**Architecture Features:**

- EC2 Launch Template for automated provisioning
- Application Load Balancer (ALB) for traffic distribution
- Auto Scaling Group (ASG) for elasticity
- RDS MySQL instance (single-AZ)
- Security Groups for tiered access control
- AWS Secrets Manager for credential security
- Ubuntu + Node.js app deployment

---

## 🎯 Objectives Met

| Goal                        | Description |
|----------------------------|-------------|
| ✅ Functional              | Users can view, add, edit, and delete student records via a web UI |
| ✅ Load Balanced           | Traffic is distributed across EC2 instances using an ALB |
| ✅ Scalable                | Auto Scaling Group adjusts instance count based on CPU utilization |
| ✅ Highly Available        | ASG ensures desired capacity; failed instances are replaced automatically |
| ✅ Secure                  | Public access limited to ALB; RDS only accessible from EC2s |
| ✅ Cost Optimized          | Used T2/T3 burstable EC2s, minimal RDS setup |
| ✅ High Performing         | Response times <1s under load test of 1000+ RPS |

---

## 🧱 Technologies Used

- **Node.js** & Express web application
- **MySQL** (Amazon RDS)
- **EC2**, **Launch Templates**, **Auto Scaling Group**
- **Application Load Balancer**
- **Secrets Manager**
- **Cloud9** for testing and load generation
- **`loadtest`** npm tool for performance validation

---

## 📂 Project Structure

```
.
├── app/                    # MVC-style Express controllers & models
├── public/                 # Static frontend assets
├── views/                 # Mustache HTML templates
├── index.js               # App entry point
└── package.json           # Node dependencies
```

---

## 🛠 Deployment Script

The app is bootstrapped using EC2 user data:

```bash
#!/bin/bash -xe
apt update -y
apt install -y nodejs unzip wget npm mysql-client git

# Clone the latest code
cd /home/ubuntu
git clone https://github.com/Clinton-dev/xyz-uni-web-app.git app
cd app/resources/codebase_partner

# Install dependencies
npm install
npm install @aws-sdk/client-secrets-manager

# Launch in background
export APP_PORT=80
node index.js >> /var/log/coffee-api.log 2>&1 &

# Add startup script
echo '#!/bin/bash -xe
cd /home/ubuntu/app/resources/codebase_partner
node index.js >> /var/log/coffee-api.log 2>&1 &' | tee /etc/rc.local
chmod +x /etc/rc.local
```

---

## 🔐 Secrets Management

Database credentials are securely retrieved at runtime from [AWS Secrets Manager](w). The app uses the v3 SDK:

```js
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

export const getSecretValue = async (secretName = "SECRET_NAME") => {
  const client = new SecretsManagerClient();
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    }),
  );
  console.log(response);

 if (response.SecretString) {
    return response.SecretString;
  }
};
```

---

## 🚀 Load Testing & Scaling

Load testing performed using `loadtest`:

```bash
loadtest --rps 5500 -c 3000 -k http://<ALB-DNS>/students
```

- Target Tracking Policy: Average CPU > 50%
- Max instances: 6, Min: 1, Desired: 2
- Verified dynamic instance launch on heavy load

---

## 🌐 Load Balancer Health Checks

- Path: `/students`
- Success Codes: `200`
- Healthy threshold: 5
- Interval: 30 seconds

---

## 📊 Cost Estimation

Used [AWS Pricing Calculator](w) for:

- EC2: t4g.medium × 2–6 instances savings plan 3yrs no upfront
- RDS: db.t4.medium MySQL, 1-AZ
- ALB: 10 GB data, 100k new connections/month
- NAT Gateways(1): For RDS instance in private subnet
- CloudWatch
- AWS DataTransfere: outbound internet(50GB per month) 

Estimated monthly cost: **~$233 USD**

---

## 📌 Lessons Learned

- Secrets Manager integration simplified credential security
- Auto Scaling with target tracking worked reliably
- A good startup script ensures long-term maintainability

---

## ✅ Next Steps (Improvements)

- Use HTTPS with ACM + ALB listener rules
- Implement a multi-AZ RDS for better HA
- Use Terraform or CloudFormation for infrastructure-as-code
- Add CloudWatch alarms & logging

---

## 🧑‍💻 Author

Clinton Wambugu  
GitHub: [Clinton-dev](https://github.com/Clinton-dev)

---

> This project was completed as part of the AWS Academy Capstone, demonstrating skills in cloud architecture, automation, scalability, and performance tuning.
