import { ProjectFileEntry } from '@ai-scanner/scanner-core';

export interface SampleProjectDefinition {
  id: string;
  name: string;
  description: string;
  sourceType: 'LOCAL';
  files: ProjectFileEntry[];
}

export const SAMPLE_PROJECTS: SampleProjectDefinition[] = [
  {
    id: 'sample-fintech-bank',
    name: 'Fintech Payment & Banking Core',
    description: 'High-throughput payment processing engine with ledger, card tokenization, and customer accounts.',
    sourceType: 'LOCAL',
    files: [
      {
        path: 'src/services/PaymentService.ts',
        content: `import { db } from '../db';
import { CardVault } from './CardVault';
import { NotificationService } from './NotificationService';

export class PaymentService {
  // Hardcoded AWS credentials for card vaulting service
  private awsKey = process.env.AWS_KEY || "";
  private stripeToken = process.env.STRIPE_TOKEN || "";

  public async processTransaction(userId: string, amount: number, cardId: string) {
    // VULNERABILITY: SQL Injection via unescaped string concatenation
    const query = "SELECT * FROM accounts WHERE user_id = '" + userId + "' AND status = 'ACTIVE'";
    const account = await db.rawQuery(query);

    if (!account) {
      throw new Error("Account not found");
    }

    // ANTI-PATTERN: N+1 query loop for transaction logs
    const previousTransactions = await db.rawQuery("SELECT id FROM transactions WHERE user_id = '" + userId + "'");
    for (const tx of previousTransactions) {
      const logs = await db.rawQuery("SELECT * FROM audit_logs WHERE transaction_id = '" + tx.id + "'");
    }

    return { status: "SUCCESS", transactionId: "TX_" + Date.now() };
  }
}`,
        size: 980,
      },
      {
        path: 'src/services/CardVault.ts',
        content: `import { PaymentService } from './PaymentService';

// CIRCULAR DEPENDENCY: PaymentService <-> CardVault
export class CardVault {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  public tokenizeCard(pan: string, cvv: string) {
    // Cryptographic weakness: MD5 hash used for card tokenization
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(pan + cvv).digest('hex');
    return "tok_" + hash;
  }
}`,
        size: 520,
      },
      {
        path: 'src/services/NotificationService.ts',
        content: `export class NotificationService {
  public async sendAlert(email: string, message: string) {
    console.log(\`Sending alert to \${email}: \${message}\`);
    return true;
  }
}`,
        size: 210,
      },
      {
        path: 'package.json',
        content: JSON.stringify({
          name: "fintech-payment-core",
          version: "1.0.0",
          dependencies: {
            "jsonwebtoken": "8.5.1",
            "lodash": "4.17.15",
            "axios": "0.20.0"
          }
        }, null, 2),
        size: 190,
      },
      {
        path: 'Dockerfile',
        content: `FROM node:latest
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]`,
        size: 110,
      },
      {
        path: 'README.md',
        content: `# Fintech Payment & Banking Core\n\nHigh throughput transactional payment gateway.`,
        size: 80,
      }
    ]
  },
  {
    id: 'sample-ecommerce-next',
    name: 'Global E-Commerce Storefront',
    description: 'Next.js 15 enterprise retail application with product catalogs, shopping cart, and search.',
    sourceType: 'LOCAL',
    files: [
      {
        path: 'src/app/api/checkout/route.ts',
        content: `import { NextResponse } from 'next/server';

// VULNERABILITY: Missing authorization verification on state-changing route
export async function POST(req: Request) {
  const body = await req.json();
  const { cartId, totalAmount } = body;
  
  // Unvalidated payment processing
  return NextResponse.json({ success: true, orderId: "ORD-9921" });
}`,
        size: 340,
      },
      {
        path: 'src/components/ProductDescription.tsx',
        content: `import React from 'react';

export function ProductDescription({ rawHtmlContent }: { rawHtmlContent: string }) {
  // VULNERABILITY: XSS via dangerouslySetInnerHTML without sanitization
  return (
    <div className="product-desc">
      <h3>Product Details</h3>
      <div dangerouslySetInnerHTML={{ __html: rawHtmlContent }} />
    </div>
  );
}`,
        size: 320,
      },
      {
        path: 'src/lib/analytics.ts',
        content: `import fs from 'fs';

export function logPageView(page: string) {
  // PERFORMANCE: Blocking synchronous file write in web runtime
  fs.writeFileSync('./pageviews.log', page + '\\n', { flag: 'a' });
}`,
        size: 210,
      },
      {
        path: 'package.json',
        content: JSON.stringify({
          name: "ecommerce-storefront",
          version: "2.1.0",
          dependencies: {
            "next": "15.1.0",
            "react": "19.0.0",
            "react-dom": "19.0.0",
            "lodash": "4.17.20"
          }
        }, null, 2),
        size: 200,
      },
      {
        path: 'README.md',
        content: `# Global E-Commerce Storefront\n\n## Setup\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n## Usage\nRun development server on port 3000.`,
        size: 150,
      }
    ]
  },
  {
    id: 'sample-ai-microservice',
    name: 'Python ML Inference & Cloud Pipeline',
    description: 'FastAPI microservice executing PyTorch model inference, Kubernetes orchestration, and data ingestion.',
    sourceType: 'LOCAL',
    files: [
      {
        path: 'app/main.py',
        content: `import pickle
import os
from fastapi import FastAPI, Request

app = FastAPI()

# VULNERABILITY: Insecure Deserialization via pickle
@app.post("/predict")
async def predict(request: Request):
    raw_data = await request.body()
    model_payload = pickle.loads(raw_data)
    return {"prediction": "processed", "data": str(model_payload)}

# VULNERABILITY: Command Injection via os.system
@app.get("/export-logs")
def export_logs(filename: str):
    os.system("tar -czf /tmp/" + filename + " /var/log/app.log")
    return {"status": "exported"}
`,
        size: 510,
      },
      {
        path: 'k8s/deployment.yaml',
        content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-inference-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: inference
        image: ml-inference:latest
        securityContext:
          privileged: true
          readOnlyRootFilesystem: false
`,
        size: 280,
      },
      {
        path: 'requirements.txt',
        content: `fastapi==0.64.0\nuvicorn==0.13.4\nrequests==2.19.0\n`,
        size: 60,
      },
      {
        path: 'Dockerfile',
        content: `FROM python:3.11\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]`,
        size: 160,
      }
    ]
  }
];
