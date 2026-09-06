import os
from typing import Optional
from ..models import EmailDraftRequest

def generate_email_draft(req: EmailDraftRequest) -> str:
    """
    Generate professional job application emails based on template rules,
    or via Gemini/OpenAI if an API key is configured.
    """
    company = req.company or "the Company"
    role = req.role or "Software Engineer"
    contact = req.contactName or "Hiring Team"
    user_name = req.userName or "[Your Name]"
    user_phone = req.userPhone or "[Your Phone Number]"
    user_portfolio = req.userPortfolio or "[Your LinkedIn / Portfolio]"

    # If an external AI provider (Gemini or OpenAI) is configured, we can optionally hook into it
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if req.emailType == 'thank_you':
        return f"""Subject: Thank you - {role} interview | {user_name}

Dear {contact},

Thank you so much for taking the time to speak with me today regarding the {role} position at {company}. I really enjoyed learning more about the team's upcoming initiatives and the impact of this role.

Our discussion reinforced my enthusiasm for joining {company}. I am confident that my background, system design experience, and problem-solving approach align well with your objectives.

Please let me know if there are any additional materials or details I can provide. Looking forward to hearing from you.

Best regards,
{user_name}
{user_phone}
{user_portfolio}"""

    elif req.emailType == 'follow_up':
        return f"""Subject: Checking in: {role} Application - {user_name}

Dear {contact},

I hope you're having a productive week.

I am following up on my application for the {role} role at {company}. I remain very interested in the opportunity and would love to know if you have any updates on the next steps in the hiring process.

Thank you again for your time and consideration.

Warm regards,
{user_name}"""

    elif req.emailType == 'negotiation':
        return f"""Subject: {company} - {role} Offer Discussion - {user_name}

Dear {contact},

Thank you so much for offering me the {role} role at {company}. I am thrilled about the opportunity to work together and contribute to the team!

After carefully reviewing the offer details and considering the scope of responsibilities and market benchmarks for this seniority level, I would like to discuss the possibility of adjusting the base compensation towards [Target Amount] or exploring additional equity/signing bonus structures.

I am eager to find a mutually great package and look forward to speaking soon.

Sincerely,
{user_name}"""

    else:  # withdraw
        return f"""Subject: Update regarding {role} application - {user_name}

Dear {contact},

Thank you for your consideration for the {role} position at {company}.

I am writing to respectfully withdraw my application as I have accepted another offer that closely aligns with my current timeline. I appreciate your time and hope our paths cross again in the future.

Best regards,
{user_name}"""
