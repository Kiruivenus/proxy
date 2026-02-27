import { Header } from '@/components/header'
import { getSession } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Send } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'FAQ - RayProxy Hub',
  description: 'Frequently asked questions about RayProxy Hub proxies and email services',
}

const faqCategories = [
  {
    category: 'Account & Registration',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Visit the registration page and fill in your email address and password. After registration, you can immediately access your dashboard.',
      },
      {
        q: 'Can I use multiple accounts?',
        a: 'Yes, you can create multiple accounts with different email addresses. However, we recommend using one account per user for better management.',
      },
      {
        q: 'How do I reset my password?',
        a: 'Go to the login page and click "Forgot Password". Enter your email, verify the reset code sent to your email, and set a new password.',
      },
      {
        q: 'Can I change my email address?',
        a: 'Currently, email changes need to be done through our support team. Contact us via WhatsApp or Telegram for assistance.',
      },
      {
        q: 'Is my account data secure?',
        a: 'Yes, we use industry-standard encryption and security practices to protect your data. All passwords are hashed and never stored in plain text.',
      },
    ],
  },
  {
    category: 'Payments & Billing',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We currently accept M-Pesa for all payments. This is a secure and widely available payment method in Kenya and other African countries.',
      },
      {
        q: 'How long does it take for M-Pesa payment to reflect?',
        a: 'M-Pesa payments are usually reflected in your account immediately. If there\'s a delay, please check your transaction status or contact support.',
      },
      {
        q: 'Can I get a refund?',
        a: 'Refunds are subject to our refund policy. Please contact our support team to discuss your specific situation.',
      },
      {
        q: 'Is there a minimum top-up amount?',
        a: 'Yes, the minimum top-up amount is typically 100 KES. Check the top-up page for current minimum amounts.',
      },
      {
        q: 'Can I save my payment method?',
        a: 'M-Pesa payments are processed each time you top up. Your M-Pesa account is used directly for transactions.',
      },
    ],
  },
  {
    category: 'Proxies',
    questions: [
      {
        q: 'What are proxies and how do they work?',
        a: 'Proxies are servers that act as intermediaries between your device and the internet. When you use a proxy, your internet traffic is routed through it, masking your real IP address.',
      },
      {
        q: 'How long are proxies valid?',
        a: 'Our proxies are sold on a daily basis. Once purchased, they remain active until the expiry time shown in your dashboard. You can see the exact expiry date before purchasing.',
      },
      {
        q: 'Can I use proxies from multiple countries simultaneously?',
        a: 'Yes! You can purchase proxies from different countries and use them at the same time. Each proxy can be used independently.',
      },
      {
        q: 'How do I use my purchased proxies?',
        a: 'After purchasing a proxy, go to your dashboard to find the IP address, port, username, and password. Configure your application with these credentials.',
      },
      {
        q: 'Can I share my proxy with others?',
        a: 'No, proxies are for your personal or business use only. Sharing is against our terms of service and may result in account suspension.',
      },
      {
        q: 'What if the proxy is slow or not working?',
        a: 'Contact our support team immediately. We\'ll investigate and either fix the issue or provide you with a replacement proxy.',
      },
      {
        q: 'Are there any usage limits?',
        a: 'Yes, each proxy has a maximum usage limit. When you reach this limit, you\'ll need to purchase a new proxy. The current limits are shown during purchase.',
      },
      {
        q: 'Can I resell proxies?',
        a: 'No, reselling our proxies is not permitted. Proxies are for your personal or business use only.',
      },
    ],
  },
  {
    category: 'Email Accounts',
    questions: [
      {
        q: 'What email accounts do you offer?',
        a: 'We offer quality email accounts from various domains. You can purchase individual accounts or bulk accounts depending on your needs.',
      },
      {
        q: 'Can I use the email accounts for sending emails?',
        a: 'Yes, but we recommend setting up SMTP for reliable email sending. Check our SMTP setup guide for detailed instructions.',
      },
      {
        q: 'How do I reset an email account password?',
        a: 'Contact our support team if you need to reset an email password. They can assist you with account recovery.',
      },
      {
        q: 'Can I change the email address format?',
        a: 'No, email addresses are fixed. You can only purchase additional accounts if you need different email formats.',
      },
      {
        q: 'Are there any sending limits?',
        a: 'Yes, email accounts have daily sending limits to prevent abuse. The limits vary by domain and are shown during purchase.',
      },
      {
        q: 'Can I use multiple email accounts?',
        a: 'Yes, you can purchase and use multiple email accounts from different or the same domains.',
      },
    ],
  },
  {
    category: 'SMTP & Email Sending',
    questions: [
      {
        q: 'What is SMTP?',
        a: 'SMTP (Simple Mail Transfer Protocol) is the standard protocol for sending emails. It allows your application to send emails from a mail server.',
      },
      {
        q: 'How do I set up SMTP?',
        a: 'Visit our SMTP setup guide in the documentation section. It includes step-by-step instructions for Gmail and other providers.',
      },
      {
        q: 'What are the SMTP credentials?',
        a: 'SMTP credentials typically include: host, port, username (email), and password. These are provided when you purchase an email account.',
      },
      {
        q: 'Which port should I use for SMTP?',
        a: 'We recommend port 587 (TLS) for better compatibility. Port 465 (SSL) is also supported but less commonly used.',
      },
      {
        q: 'Why are my emails going to spam?',
        a: 'This could be due to missing SPF, DKIM, or DMARC records. Check our troubleshooting guide for solutions.',
      },
      {
        q: 'Can I send emails to any address?',
        a: 'You can send to most addresses, but some may have spam filters. Always use proper email headers and avoid spam trigger words.',
      },
    ],
  },
  {
    category: 'Dashboard & Management',
    questions: [
      {
        q: 'How do I view my purchased proxies?',
        a: 'Go to your dashboard > Proxies section. You\'ll see all your active and expired proxies with their details and expiry times.',
      },
      {
        q: 'Where can I see my email accounts?',
        a: 'Visit your dashboard > Emails section. All your purchased email accounts are listed there with their details.',
      },
      {
        q: 'How do I check my order history?',
        a: 'Go to your dashboard > Orders. You\'ll see a complete history of all your purchases with dates and prices.',
      },
      {
        q: 'Can I download my account information?',
        a: 'You can view and copy all your proxy and email details from your dashboard. We currently don\'t support automatic export.',
      },
      {
        q: 'How do I track my top-ups?',
        a: 'Go to your dashboard > Transactions. All your top-ups and payments are listed there for your records.',
      },
    ],
  },
  {
    category: 'Support & Troubleshooting',
    questions: [
      {
        q: 'How do I contact support?',
        a: 'You can reach our support team via WhatsApp or Telegram. Links are available on the Support page.',
      },
      {
        q: 'What are your support hours?',
        a: 'We provide 24/7 support via WhatsApp and Telegram. Response times may vary depending on volume.',
      },
      {
        q: 'What if I forget my login credentials?',
        a: 'Use the "Forgot Password" link on the login page to reset your password. If you forget your email, contact support.',
      },
      {
        q: 'How do I report a bug or issue?',
        a: 'Contact our support team with details of the issue. Include screenshots or error messages if possible.',
      },
      {
        q: 'What if a proxy or email is not working?',
        a: 'First, verify your credentials and configuration. If it still doesn\'t work, contact support for a replacement or refund.',
      },
    ],
  },
  {
    category: 'Security & Privacy',
    questions: [
      {
        q: 'Is my data encrypted?',
        a: 'Yes, all data in transit is encrypted using SSL/TLS. Sensitive data like passwords are hashed before storage.',
      },
      {
        q: 'Do you log user activity?',
        a: 'We log essential transactions and errors for security and service improvement purposes. Detailed proxy usage logs are not kept.',
      },
      {
        q: 'Can you see my proxy usage?',
        a: 'We can see general usage statistics but not specific websites or data you access through proxies.',
      },
      {
        q: 'What\'s your refund policy?',
        a: 'Refunds are considered case-by-case. Contact support for specific refund requests.',
      },
      {
        q: 'Can my account be suspended?',
        a: 'Yes, accounts may be suspended for violating our terms of service, such as reselling or abusive usage.',
      },
    ],
  },
]

export default async function FAQPage() {
  const session = await getSession()

  return (
    <main className="min-h-screen bg-background">
      <Header user={session?.user} />

      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Find answers to common questions about RayProxy Hub
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h2 className="mb-6 text-2xl font-bold">{category.category}</h2>
            <div className="space-y-4">
              {category.questions.map((item, questionIndex) => (
                <Card key={`${categoryIndex}-${questionIndex}`}>
                  <CardHeader>
                    <CardTitle className="text-base">{item.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Still Have Questions */}
        <Card className="border-accent/50 bg-accent/5">
          <CardHeader>
            <CardTitle>Didn't find your answer?</CardTitle>
            <CardDescription>
              Our support team is here to help you with any questions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <Button asChild>
              <Link href="/support" className="inline-flex items-center gap-2">
                <Send className="h-4 w-4" />
                Contact Support
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs" className="inline-flex items-center gap-2">
                View Documentation
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
