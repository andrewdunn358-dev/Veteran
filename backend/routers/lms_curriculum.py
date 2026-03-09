"""
Radio Check Peer to Peer Training - Complete Curriculum
All 14 modules with content, images, quizzes, and external resources
"""

# Image URLs for each module
MODULE_IMAGES = {
    "m1-intro": "https://static.prod-images.emergentagent.com/jobs/3de3c55e-9fc6-4c2d-9dc4-071c6e555e91/images/772e89b5178af951e8e4ed8f62fda3c6b9eee99e2bde5cd2115859be4746172d.png",
    "m2-algee": "https://static.prod-images.emergentagent.com/jobs/3de3c55e-9fc6-4c2d-9dc4-071c6e555e91/images/bd77cbf419b0db2bc658599d5831f0be3ed0b4879093c3a75bdbc9acd7dba161.png",
    "m3-ethics": "https://static.prod-images.emergentagent.com/jobs/3de3c55e-9fc6-4c2d-9dc4-071c6e555e91/images/9871ceb2034d84d4edb1126ce242712b87d04c6e9177d21eee8947f69884e10a.png",
    "m4-communication": "https://static.prod-images.emergentagent.com/jobs/3de3c55e-9fc6-4c2d-9dc4-071c6e555e91/images/473eb46c6e85802bb3675af83fec2fa39454f833d57657db6513c9d3590c40b2.png",
    "m5-crisis": "https://static.prod-images.emergentagent.com/jobs/3de3c55e-9fc6-4c2d-9dc4-071c6e555e91/images/d9c54fe88659bb3b8b826e927345be4309f860b411aedfd83000bbc637d272d6.png",
    "m6-ptsd": "https://static.prod-images.emergentagent.com/jobs/3de3c55e-9fc6-4c2d-9dc4-071c6e555e91/images/6ccd036e90052795e9f4c515d1f4279b8ec8fcb05f7ea9a684ba6398df64f5d7.png",
    "m7-depression": "https://static.prod-images.emergentagent.com/jobs/3de3c55e-9fc6-4c2d-9dc4-071c6e555e91/images/463501bcde47e7384182463ec5c9194858b8dcc9cd4804afafb901aad795d309.png",
    "m8-selfcare": "https://static.prod-images.emergentagent.com/jobs/3de3c55e-9fc6-4c2d-9dc4-071c6e555e91/images/e8a3b05ae5a37455410abe051f90a1733e3ac3f85cc9a92e3158f335453e036c.png",
    "m9-substance": "https://static.prod-images.emergentagent.com/jobs/3de3c55e-9fc6-4c2d-9dc4-071c6e555e91/images/918aa711cf1e040cfe107044b6bdf0e986365b278434763dd807209811a10657.png",
    "m10-safeguarding": "https://static.prod-images.emergentagent.com/jobs/3de3c55e-9fc6-4c2d-9dc4-071c6e555e91/images/d0dbb765a633a76918f97bd9fd6f90d5e360230e81ade44f58cd6cf114838b8d.png",
    "m11-diversity": "https://static.prod-images.emergentagent.com/jobs/3de3c55e-9fc6-4c2d-9dc4-071c6e555e91/images/7acdd6b65cf29c4501c578c7a0e0519c3301b660c4ccd07c596782970df5541e.png",
    "m12-practical": "https://static.prod-images.emergentagent.com/jobs/3de3c55e-9fc6-4c2d-9dc4-071c6e555e91/images/d502f0250a1bc1a4fefe165070172147c4ba909d87fa02f3ab2a0e79cdc1dc79.png",
    "m13-casestudies": "https://static.prod-images.emergentagent.com/jobs/3de3c55e-9fc6-4c2d-9dc4-071c6e555e91/images/3ce7d4813afdbbaf618ecdba59afd0470806549a2bb47a0108a4dd06057a5699.png",
    "m14-completion": "https://static.prod-images.emergentagent.com/jobs/3de3c55e-9fc6-4c2d-9dc4-071c6e555e91/images/f9e0a4ece46e9c66a8777ddb09a4a4023980d47acb930ad8be171f342039a9b6.png"
}

RADIOCHECK_CURRICULUM = {
    "course_id": "radiocheck-p2p-v1",
    "title": "Radio Check Peer to Peer Training",
    "description": """Welcome to Radio Check Peer to Peer Training - a comprehensive course preparing you to become a peer support volunteer for fellow veterans.
    
This training will equip you with the skills and knowledge to:

- Recognise signs of mental health difficulties in veterans
- Provide safe, ethical peer support using the ALGEE framework
- Know when and how to refer to professional services
- Understand BACP ethical boundaries and confidentiality
- Support veterans with PTSD, depression, anxiety, and crisis situations
- Practice effective communication and active listening

**Important:** This course qualifies you as a Radio Check Peer Supporter, NOT as a counsellor or therapist. Peer supporters provide listening support and signposting only.

Upon completion, you will receive a Radio Check Peer Supporter Certificate.""",
    "duration_hours": 16,
    "passing_score": 80,
    "critical_modules_pass_rate": 100,
    "trainer": {
        "name": "Radio Check Training Team",
        "credentials": "Developed in partnership with mental health professionals and veteran support specialists",
        "bacp_reference": "Content aligned with BACP Ethical Framework for the Counselling Professions"
    },
    "modules": [
        # ===================================================================
        # MODULE 1: INTRODUCTION TO MENTAL HEALTH
        # ===================================================================
        {
            "id": "m1-intro",
            "title": "Introduction to Mental Health",
            "description": "Understanding mental health, mental illness, and the role of peer support for veterans",
            "duration_minutes": 60,
            "order": 1,
            "is_critical": False,
            "image_url": MODULE_IMAGES["m1-intro"],
            "content": """
## Welcome to Radio Check Peer to Peer Training

This is the first module of your journey to becoming a Radio Check Peer Supporter. In this module, you'll learn the fundamentals of mental health and understand the vital role peer support plays in veteran wellbeing.

---

## What is Mental Health?

Mental health is a state of wellbeing in which an individual:
- Realises their own abilities
- Can cope with normal stresses of life
- Can work productively
- Can contribute to their community

**Mental health is not simply the absence of mental illness.** We all have mental health, just as we all have physical health. It exists on a spectrum and fluctuates based on life circumstances.

### The Mental Health Continuum

Think of mental health as a continuum rather than a fixed state:

**Thriving** → **Surviving** → **Struggling** → **In Crisis**

Everyone moves along this continuum throughout their lives. A veteran might be thriving one month, then experience a trigger that moves them towards struggling. This is normal and doesn't mean they have a mental illness.

**Factors that affect where we are on the continuum:**
- Sleep quality and quantity
- Physical health and exercise
- Relationships and social connections
- Work or purpose
- Financial security
- Life events (bereavement, divorce, job loss)
- Past trauma or experiences
- Access to support

---

## Mental Health vs Mental Illness

It's crucial to understand the difference between mental health and mental illness:

| Mental Health | Mental Illness |
|---------------|----------------|
| How we think, feel, and cope | A diagnosable condition |
| Fluctuates day to day | Requires professional treatment |
| Affected by life events | Has specific symptoms and criteria |
| Everyone has it | Affects approximately 1 in 4 people |
| Can be improved with self-care | May require medication or therapy |

### Common Mental Health Conditions

**Depression** - Persistent low mood, loss of interest, feelings of worthlessness. More than just "feeling sad" - it affects daily functioning.

**Anxiety Disorders** - Excessive worry, panic attacks, phobias. The body's threat response becomes overactive.

**Post-Traumatic Stress Disorder (PTSD)** - Develops after experiencing or witnessing traumatic events. Includes flashbacks, nightmares, hypervigilance.

**Complex PTSD** - Results from prolonged, repeated trauma. Common in veterans exposed to multiple deployments.

**Moral Injury** - Psychological damage from actions (or inaction) that violate one's moral code. Often co-occurs with PTSD in veterans.

---

## Veteran Mental Health: Understanding the Unique Challenges

### The Statistics

Understanding the scale of the challenge helps us recognise how vital peer support is:

- **1 in 5** veterans experience depression, anxiety, or PTSD
- Veterans are **2-3x more likely** to experience depression than civilians
- **Average of 2 veteran suicides per week** in the UK (Office for National Statistics)
- Only **50%** of veterans with mental health issues seek help
- **17%** of veterans report symptoms of PTSD
- **Transition from military to civilian life** is identified as a high-risk period
- Mental health conditions often emerge **years after leaving service**

### Why Veterans Are at Higher Risk

**Combat Exposure**
Direct exposure to life-threatening situations, witnessing death, and making life-or-death decisions leaves lasting psychological impacts.

**Moral Injury**
Veterans may struggle with actions they took (or didn't take) during service that conflict with their personal moral code. This is different from PTSD but equally damaging.

**Military Culture**
The culture of strength, stoicism, and "cracking on" can prevent veterans from acknowledging their struggles or seeking help.

**Loss of Identity**
For many, being a soldier was their entire identity. Leaving the military can feel like losing who you are.

**Loss of Structure**
Military life provides clear structure, purpose, and belonging. Civilian life can feel chaotic and meaningless by comparison.

**Loss of Comradeship**
The bonds formed in military service are unique. Many veterans struggle to form similar connections in civilian life.

**Physical Injuries**
Physical injuries from service can lead to chronic pain, disability, and associated mental health difficulties.

---

## Barriers to Seeking Help

Veterans face unique barriers that prevent them from accessing the support they need:

### 1. Stigma
*"Real soldiers don't need help"* - Military culture often portrays mental health struggles as weakness. Many veterans fear judgment from fellow veterans or society.

### 2. Pride and Self-Reliance
Military training instils self-reliance and the ability to cope under extreme pressure. Asking for help can feel like admitting failure.

### 3. Distrust of Services
Many veterans don't believe civilian services understand military life. Previous negative experiences with military or NHS mental health services reinforce this.

### 4. Difficulty Identifying Problems
The military trains you to suppress emotions and carry on. Many veterans don't recognise their symptoms as mental health issues - they think it's just "how they are now."

### 5. Fear of Consequences
Some veterans fear that admitting mental health struggles will affect their employment, security clearance, or how others perceive them.

### 6. Lack of Awareness
Many veterans simply don't know what support services exist or how to access them.

### 7. Minimisation
*"Others had it worse"* - Veterans often compare their experiences to those with more severe injuries or trauma, dismissing their own struggles as unimportant.

**This is where YOU come in as a peer supporter.** You understand these barriers because you may have faced them yourself. You can bridge the gap between veterans and professional services.

---

## The Role of Peer Support

As a Radio Check Peer Supporter, your role is carefully defined and bounded. Understanding what you ARE and what you ARE NOT is essential for safe, ethical practice.

### You ARE:

✅ **A listening ear** - Sometimes people just need to be heard without judgment

✅ **Someone who understands military life** - Your shared experience creates instant trust

✅ **A bridge to professional services** - You help connect veterans with appropriate support

✅ **A fellow veteran who "gets it"** - The power of shared experience cannot be underestimated

✅ **A consistent, reliable presence** - Showing up regularly builds trust

✅ **A sign that recovery is possible** - Your presence shows that veterans can get through difficult times

### You are NOT:

❌ **A therapist or counsellor** - This requires years of training and professional qualification

❌ **Able to diagnose conditions** - Only qualified professionals can diagnose mental health conditions

❌ **A replacement for professional help** - You complement professional services, not replace them

❌ **Available 24/7** - You need boundaries to protect your own wellbeing

❌ **Responsible for "fixing" anyone** - You cannot control another person's recovery

❌ **Expected to have all the answers** - Saying "I don't know, but let's find out together" is perfectly acceptable

**Your role is to SUPPORT, not to FIX.**

---

## Key Principle: Working Within Your Limits

As a peer supporter, this principle will guide everything you do:

> *"I am here to listen and support. I am not here to diagnose, treat, or cure. I know my limits and I refer to professionals when needed."*

### Why Limits Matter

**For the veteran you're supporting:**
- They deserve appropriate professional help when needed
- Peer support that oversteps can delay proper treatment
- False reassurance can be harmful

**For you:**
- Prevents burnout and secondary trauma
- Protects you from taking on responsibilities beyond your training
- Keeps you effective in your role long-term

**For Radio Check:**
- Maintains the integrity and reputation of the service
- Ensures consistent, safe support across all peer supporters
- Protects everyone legally and ethically

---

## Understanding Your Own Mental Health

Before you can support others, you need to be aware of your own mental health:

### Questions to Ask Yourself

- How am I feeling right now on the mental health continuum?
- Do I have unresolved issues that might affect my ability to support others?
- What are my triggers?
- What do I do to look after my own mental health?
- Who supports me when I'm struggling?

### The Importance of Self-Care

You cannot pour from an empty cup. Throughout this training and your time as a peer supporter, you must prioritise your own wellbeing. Module 8 covers self-care in detail.

---

## Summary

In this module, you learned:

✅ **Mental health is more than the absence of illness** - It's a continuum that fluctuates for everyone

✅ **Veterans face unique mental health challenges** - Combat exposure, moral injury, loss of identity, and military culture all contribute

✅ **Significant barriers prevent veterans seeking help** - Stigma, pride, distrust, and lack of awareness

✅ **Peer support is about listening, not fixing** - Your role is clearly defined and bounded

✅ **Working within your limits is essential** - For the veteran, for you, and for Radio Check

---

## What's Next?

In Module 2, you'll learn the **ALGEE Action Plan** - the framework that will guide all your peer support interactions.
            """,
            "external_links": [
                {"title": "Mind - Understanding Mental Health", "url": "https://www.mind.org.uk/information-support/types-of-mental-health-problems/"},
                {"title": "Royal British Legion - Mental Health", "url": "https://www.britishlegion.org.uk/get-support/mental-health"},
                {"title": "Combat Stress", "url": "https://combatstress.org.uk/"},
                {"title": "NHS - Every Mind Matters", "url": "https://www.nhs.uk/every-mind-matters/"},
                {"title": "Op Courage", "url": "https://www.nhs.uk/nhs-services/armed-forces-community/mental-health/veterans-reservists/"}
            ],
            "quiz": {
                "id": "q1-intro",
                "title": "Module 1 Quiz: Introduction to Mental Health",
                "pass_rate": 80,
                "questions": [
                    {
                        "id": "q1-1",
                        "type": "true_false",
                        "question": "Mental health is simply the absence of mental illness.",
                        "options": ["True", "False"],
                        "correct": "False",
                        "explanation": "Mental health is a state of wellbeing, not just the absence of illness. We all have mental health that fluctuates based on life circumstances."
                    },
                    {
                        "id": "q1-2",
                        "type": "multiple_choice",
                        "question": "What proportion of veterans experience depression, anxiety, or PTSD?",
                        "options": ["1 in 10", "1 in 5", "1 in 2", "1 in 20"],
                        "correct": "1 in 5",
                        "explanation": "Research shows approximately 1 in 5 veterans experience these conditions - double the rate of the general population."
                    },
                    {
                        "id": "q1-3",
                        "type": "multiple_choice",
                        "question": "As a peer supporter, your role is to:",
                        "options": [
                            "Diagnose mental health conditions",
                            "Provide therapy and treatment",
                            "Listen and signpost to professional services",
                            "Prescribe coping strategies"
                        ],
                        "correct": "Listen and signpost to professional services",
                        "explanation": "Peer supporters provide listening support and help people access professional services. They do not diagnose, treat, or prescribe."
                    },
                    {
                        "id": "q1-4",
                        "type": "multiple_choice",
                        "question": "Which is NOT a common barrier to veterans seeking help?",
                        "options": [
                            "Stigma around mental health",
                            "Too many services available",
                            "Pride and self-reliance",
                            "Distrust of civilian services"
                        ],
                        "correct": "Too many services available",
                        "explanation": "Lack of awareness of services is actually a barrier, not having too many. Stigma, pride, and distrust are all common barriers veterans face."
                    },
                    {
                        "id": "q1-5",
                        "type": "multiple_choice",
                        "question": "What percentage of veterans with mental health issues seek help?",
                        "options": ["25%", "50%", "75%", "90%"],
                        "correct": "50%",
                        "explanation": "Only about half of veterans with mental health issues seek professional help, highlighting the importance of peer support in bridging this gap."
                    }
                ]
            }
        },
        
        # ===================================================================
        # MODULE 2: THE ALGEE ACTION PLAN
        # ===================================================================
        {
            "id": "m2-algee",
            "title": "The ALGEE Action Plan",
            "description": "Learn the five-step framework for providing peer support",
            "duration_minutes": 60,
            "order": 2,
            "is_critical": False,
            "image_url": MODULE_IMAGES["m2-algee"],
            "content": """
## The ALGEE Action Plan

ALGEE is the core framework used in Mental Health First Aid worldwide. It provides a structured, memorable approach to helping someone experiencing mental health difficulties.

**A** - Approach, Assess, Assist
**L** - Listen Non-judgmentally
**G** - Give Reassurance and Information
**E** - Encourage Appropriate Professional Help
**E** - Encourage Self-Help and Other Supports

---

## A - Approach, Assess, Assist

### Approach
How you approach someone matters enormously. Choose the right moment and setting:

- Find a quiet, private place if possible
- Choose a time when you won't be interrupted
- Be calm and patient - don't rush
- Respect their personal space
- Make eye contact without staring

**Opening the conversation:**
- "I've noticed you seem a bit down lately. How are you doing?"
- "Is everything okay? I'm here if you want to chat."
- "I've been thinking about you. Fancy a brew and a chat?"

### Assess
Assess the situation for any risk of harm:

**Warning signs to look for:**
- Talking about wanting to die or kill themselves
- Looking for ways to harm themselves
- Talking about feeling hopeless or having no purpose
- Talking about being a burden to others
- Increasing alcohol or drug use
- Withdrawing from activities
- Giving away possessions

**If you're concerned, ask directly:**
- "Are you thinking about hurting yourself?"
- "Are you having thoughts of suicide?"

Asking about suicide does NOT plant the idea. It can save lives.

### Assist
If there is immediate danger:
- **Call 999** for emergencies
- **NHS 111 Option 2** for mental health crisis
- Do not leave them alone
- Remove means of harm if safe to do so
- Follow safeguarding protocols

---

## L - Listen Non-judgmentally

Listening is the most powerful tool you have. It sounds simple, but truly listening without judgment is a skill that takes practice.

### How to Listen Well:

**DO:**
- Give your full attention (put your phone away)
- Make appropriate eye contact
- Use open body language
- Nod and use verbal encouragers ("mmm", "go on")
- Reflect back what you hear ("It sounds like...")
- Accept what they say without challenging
- Allow silences - they're thinking

**DON'T:**
- Interrupt
- Finish their sentences
- Look at your phone
- Think about what to say next
- Judge or criticise
- Jump to solutions

### Things to AVOID Saying:

| Don't Say | Why It's Harmful |
|-----------|------------------|
| "You should..." | Tells them what to do |
| "At least..." | Minimises their pain |
| "I know how you feel" | You don't - their experience is unique |
| "Cheer up" | Dismisses their feelings |
| "Others have it worse" | Invalidates their struggle |
| "Man up" | Stigmatises vulnerability |
| "Think positive" | Oversimplifies the problem |

### Helpful Things to Say:

- "I'm here for you"
- "That sounds really difficult"
- "Tell me more about that"
- "How are you coping with this?"
- "That must be hard"
- "Thank you for trusting me with this"
- "It took courage to tell me"

---

## G - Give Reassurance and Information

Once you've listened, offer reassurance:

### Reassurance:
- "You've done the right thing by talking to me"
- "Mental health problems are common and treatable"
- "You're not alone - many people go through this"
- "Help is available"
- "Things can get better"

### Information:
Share relevant information when appropriate:
- Information about mental health conditions
- Available support services
- Self-help resources
- What professional help looks like

**Important:** Don't overload them with information. Keep it simple and relevant.

---

## E - Encourage Professional Help

Help them understand their options for professional support:

### Professional Services Available:
- **GP** - First point of contact for most people
- **NHS 111 Option 2** - Mental health crisis line
- **Op Courage** - NHS veteran mental health service
- **Combat Stress** - Veteran mental health charity
- **IAPT** - NHS talking therapies
- **Private therapy** - If they prefer

### How to Encourage Help-Seeking:

**Normalise it:**
- "Lots of veterans find talking to someone helpful"
- "It's like going to the doctor for a physical injury"

**Remove barriers:**
- "I can help you find a number if you like"
- "Would it help if we looked at options together?"

**Offer support:**
- "Would you like me to be there when you call?"
- "I can come with you to the appointment if you want"

**Don't pressure:**
- It's their choice
- Plant the seed and follow up later

---

## E - Encourage Self-Help and Other Supports

The final E is about encouraging ongoing support and self-care:

### Self-Help Strategies:
- Regular exercise and physical activity
- Maintaining routines
- Connecting with others
- Limiting alcohol
- Getting enough sleep
- Spending time outdoors
- Hobbies and interests

### Other Supports:
- Peer support groups
- Veteran organisations
- Family and friends
- Online communities
- Helplines

**Remember:** You are encouraging, not prescribing. Suggest options, don't tell them what to do.

---

## Further Reading

- **Mental Health First Aid England**: https://mhfaengland.org/
- **Rethink Mental Illness - How to Support Someone**: https://www.rethink.org/advice-and-information/carers-hub/
- **Samaritans - How to Support Someone**: https://www.samaritans.org/how-we-can-help/if-youre-worried-about-someone-else/
- **Veterans Gateway**: https://www.veteransgateway.org.uk/

---

## Summary

In this module, you learned:
- The ALGEE framework for peer support
- How to approach someone and assess risk
- The importance of non-judgmental listening
- How to give reassurance without minimising
- Ways to encourage professional help
- Supporting self-help and ongoing connections
            """,
            "external_links": [
                {"title": "Mental Health First Aid England", "url": "https://mhfaengland.org/"},
                {"title": "Rethink Mental Illness - How to Support Someone", "url": "https://www.rethink.org/advice-and-information/carers-hub/"},
                {"title": "Samaritans - How to Support Someone", "url": "https://www.samaritans.org/how-we-can-help/if-youre-worried-about-someone-else/"},
                {"title": "Veterans Gateway", "url": "https://www.veteransgateway.org.uk/"}
            ],
            "quiz": {
                "id": "q2-algee",
                "title": "Module 2 Quiz: The ALGEE Action Plan",
                "pass_rate": 80,
                "questions": [
                    {
                        "id": "q2-1",
                        "type": "multiple_choice",
                        "question": "What does the 'A' in ALGEE stand for?",
                        "options": [
                            "Accept and Adapt",
                            "Approach, Assess, Assist",
                            "Ask and Answer",
                            "Attend and Act"
                        ],
                        "correct": "Approach, Assess, Assist",
                        "explanation": "The first step is to Approach the person appropriately, Assess for risk of harm, and Assist with any crisis situation."
                    },
                    {
                        "id": "q2-2",
                        "type": "multiple_choice",
                        "question": "Which of these is judgmental language to AVOID?",
                        "options": [
                            "That sounds really difficult",
                            "At least you have a job",
                            "Tell me more about how you're feeling",
                            "I'm here for you"
                        ],
                        "correct": "At least you have a job",
                        "explanation": "'At least...' statements minimise the person's experience and are judgmental. They dismiss their feelings."
                    },
                    {
                        "id": "q2-3",
                        "type": "true_false",
                        "question": "Asking someone directly about suicide can plant the idea in their head.",
                        "options": ["True", "False"],
                        "correct": "False",
                        "explanation": "Research shows that asking about suicide does NOT plant the idea. It can actually save lives by opening up conversation about something they may be struggling with."
                    },
                    {
                        "id": "q2-4",
                        "type": "multiple_choice",
                        "question": "When encouraging professional help, you should:",
                        "options": [
                            "Tell them they must see a doctor immediately",
                            "Diagnose their condition first",
                            "Normalise help-seeking and offer practical support",
                            "Give them an ultimatum"
                        ],
                        "correct": "Normalise help-seeking and offer practical support",
                        "explanation": "Encouraging professional help means making it feel normal and offering practical support like helping find a number or offering to go with them."
                    },
                    {
                        "id": "q2-5",
                        "type": "multiple_choice",
                        "question": "If someone is in immediate danger, you should:",
                        "options": [
                            "Wait and see if they improve",
                            "Call 999 or NHS 111 Option 2",
                            "Send them a helpful article",
                            "Refer them to their GP next week"
                        ],
                        "correct": "Call 999 or NHS 111 Option 2",
                        "explanation": "Immediate danger requires immediate action. Call 999 for emergencies or NHS 111 Option 2 for mental health crisis."
                    }
                ]
            }
        },
        
        # ===================================================================
        # MODULE 3: BACP ETHICS & BOUNDARIES (CRITICAL)
        # ===================================================================
        {
            "id": "m3-ethics",
            "title": "Ethics and Boundaries",
            "description": "Understanding ethical practice and the boundaries of peer support - CRITICAL MODULE",
            "duration_minutes": 60,
            "order": 3,
            "is_critical": True,
            "image_url": MODULE_IMAGES["m3-ethics"],
            "content": """
## CRITICAL MODULE - 100% Pass Required

This module covers essential ethical boundaries aligned with the BACP (British Association for Counselling and Psychotherapy) Ethical Framework. You must pass with 100% to continue your training.

Understanding boundaries protects both you and the people you support.

---

## What Peer Support IS and IS NOT

### Peer Support IS:
- Listening without judgment
- Sharing your own experience when appropriate
- Signposting to professional services
- Providing emotional support
- Being a consistent, reliable presence
- Following Radio Check protocols
- Working within your competence

### Peer Support IS NOT:
- Therapy or counselling
- Diagnosing conditions
- Prescribing treatments
- Giving medical advice
- A substitute for professional help
- Available 24/7
- A friendship (it's a supportive relationship with boundaries)

---

## The BACP Ethical Framework

Radio Check Peer Supporters operate within principles aligned with the BACP Ethical Framework:

### 1. Being Trustworthy
- Honour the trust placed in you
- Be reliable and consistent
- Keep promises you make
- Be honest about what you can and cannot do

### 2. Autonomy
- Respect the person's right to make their own choices
- Don't impose your views or solutions
- Support their decision-making, even if you disagree
- Never pressure someone into action

### 3. Beneficence (Doing Good)
- Act in their best interests
- Use your skills appropriately
- Refer when something is beyond your competence
- Stay updated with training

### 4. Non-maleficence (Avoiding Harm)
- Avoid causing harm through your actions
- Recognise your limitations
- Don't give advice that could be harmful
- Follow safeguarding procedures

### 5. Justice
- Treat everyone fairly
- Don't discriminate
- Be aware of your biases
- Provide equal quality of support to all

### 6. Self-respect
- Look after your own wellbeing
- Know your limits
- Seek support when you need it
- Maintain boundaries for your protection too

---

## Boundaries of Competence

### You ARE Competent To:
- Listen actively and with empathy
- Validate feelings and experiences
- Share information about resources
- Recognise warning signs
- Follow escalation procedures
- Refer to professionals
- Share your own lived experience (appropriately)

### You Are NOT Competent To:
- Diagnose mental health conditions
- Provide therapy techniques (CBT, EMDR, etc.)
- Advise on medication
- Make decisions for the person
- Guarantee outcomes
- Provide ongoing crisis support
- Replace professional treatment

**If in doubt, refer out.**

---

## Confidentiality and Its Limits

### What You Keep Confidential:
- Personal details shared with you
- The content of conversations
- Their contact information
- Details about their life, family, work
- What support they're accessing

### When Confidentiality MUST Be Broken:

**You MUST report if:**
- Immediate risk of suicide or serious self-harm
- Risk of serious harm to others
- Disclosure of abuse (especially involving children or vulnerable adults)
- Terrorism-related concerns
- Court order requiring disclosure

**Always tell them at the start:**
> "What you tell me stays between us, unless I'm worried about your safety or someone else's safety. If that happens, I'll try to talk to you about it first."

### How to Break Confidentiality:
1. Tell them you need to involve someone else
2. Explain why (safety concern)
3. If possible, involve them in the process
4. Follow Radio Check escalation procedures
5. Document what happened and why

---

## Avoiding Dependency

Part of ethical practice is avoiding creating unhealthy dependency.

### Signs of Dependency:
- They only want to talk to you
- Contacting you outside agreed times
- Expecting you to solve their problems
- Getting upset or angry if you're unavailable
- Treating you like a friend rather than a supporter
- Expecting immediate responses

### How to Prevent Dependency:
- Be clear about your role from the start
- Stick to agreed contact times
- Encourage other supports (not just you)
- Regularly review the relationship
- Refer to professionals for ongoing support
- Don't share your personal contact details

### What to Say:
- "I'm here to support you, but I'm not your only support"
- "Let's talk about who else you can reach out to"
- "I want to make sure you have support even when I'm not available"

---

## Dual Relationships

A dual relationship is when you have another relationship with someone you support.

### Examples:
- Supporting a friend or family member
- Supporting someone you work with
- Supporting someone from your social group
- Becoming romantically involved with someone you support

### Why Dual Relationships Are Problematic:
- Blurs professional boundaries
- Creates power imbalances
- Makes it hard to be objective
- Can lead to conflicts of interest
- Risk of exploitation

### The Rule:
**Do not support people you have other relationships with.** If you know someone who needs support, refer them to another Radio Check volunteer.

---

## Record Keeping

You may be asked to keep brief records of your support sessions.

### Why Keep Records:
- Track the support provided
- Ensure continuity if another volunteer takes over
- Identify patterns or escalating concerns
- Evidence of following procedures

### What to Record:
- Date and duration of contact
- Brief summary of what was discussed
- Any concerns raised
- Any referrals made
- Next steps agreed

### What NOT to Record:
- Unnecessary personal details
- Judgmental language
- Your opinions about their life choices
- Information they asked to keep private

---

## Further Reading

- **BACP Ethical Framework**: https://www.bacp.co.uk/events-and-resources/ethics-and-standards/ethical-framework-for-the-counselling-professions/
- **Mind - Confidentiality**: https://www.mind.org.uk/information-support/guides-to-support-and-services/seeking-help-for-a-mental-health-problem/confidentiality/
- **NHS - Safeguarding**: https://www.england.nhs.uk/safeguarding/

---

## Summary

This critical module covered:
- The clear boundaries between peer support and professional services
- BACP ethical principles (trust, autonomy, beneficence, non-maleficence, justice, self-respect)
- Your competence boundaries
- Confidentiality and when it must be broken
- Avoiding dependency and dual relationships
- Record keeping requirements
            """,
            "external_links": [
                {"title": "BACP Ethical Framework", "url": "https://www.bacp.co.uk/events-and-resources/ethics-and-standards/ethical-framework-for-the-counselling-professions/"},
                {"title": "Mind - Confidentiality", "url": "https://www.mind.org.uk/information-support/guides-to-support-and-services/seeking-help-for-a-mental-health-problem/confidentiality/"},
                {"title": "NHS - Safeguarding", "url": "https://www.england.nhs.uk/safeguarding/"}
            ],
            "quiz": {
                "id": "q3-ethics",
                "title": "Module 3 Quiz: Ethics and Boundaries (100% Required)",
                "pass_rate": 100,
                "questions": [
                    {
                        "id": "q3-1",
                        "type": "multiple_choice",
                        "question": "As a peer supporter, which of these is within your competence?",
                        "options": [
                            "Diagnosing depression",
                            "Listening and signposting to services",
                            "Teaching CBT techniques",
                            "Advising on medication"
                        ],
                        "correct": "Listening and signposting to services",
                        "explanation": "Peer supporters are competent to listen, validate, and signpost. Diagnosing, therapy techniques, and medication advice are strictly for professionals."
                    },
                    {
                        "id": "q3-2",
                        "type": "multiple_choice",
                        "question": "When MUST you break confidentiality?",
                        "options": [
                            "When they tell you something embarrassing",
                            "When there is immediate risk of harm to themselves or others",
                            "When their family asks what you discussed",
                            "When you think they're making bad decisions"
                        ],
                        "correct": "When there is immediate risk of harm to themselves or others",
                        "explanation": "Confidentiality must be broken when there is immediate risk of harm. Personal embarrassment, family requests, or disagreeing with decisions are not valid reasons."
                    },
                    {
                        "id": "q3-3",
                        "type": "true_false",
                        "question": "It's okay to support a close friend as a Radio Check Peer Supporter.",
                        "options": ["True", "False"],
                        "correct": "False",
                        "explanation": "Dual relationships (being both friend and supporter) create boundary problems. Refer friends and family to other Radio Check volunteers."
                    },
                    {
                        "id": "q3-4",
                        "type": "multiple_choice",
                        "question": "What should you do if someone starts contacting you outside agreed times?",
                        "options": [
                            "Ignore them to teach them a lesson",
                            "Always respond immediately to avoid upsetting them",
                            "Kindly remind them of boundaries and encourage other supports",
                            "Give them your personal phone number for emergencies"
                        ],
                        "correct": "Kindly remind them of boundaries and encourage other supports",
                        "explanation": "Maintaining boundaries kindly is essential. Remind them of agreed contact times and encourage them to develop other supports for when you're not available."
                    },
                    {
                        "id": "q3-5",
                        "type": "multiple_choice",
                        "question": "What should you tell someone at the START of your conversation about confidentiality?",
                        "options": [
                            "Everything is 100% confidential no matter what",
                            "I'll tell the team everything you say",
                            "What you tell me stays between us, unless I'm worried about safety",
                            "You don't need to worry about confidentiality"
                        ],
                        "correct": "What you tell me stays between us, unless I'm worried about safety",
                        "explanation": "Be honest about the limits of confidentiality from the start. This builds trust and ensures they understand the boundaries."
                    }
                ]
            }
        },
        
        # ===================================================================
        # MODULE 4: COMMUNICATION SKILLS
        # ===================================================================
        {
            "id": "m4-communication",
            "title": "Communication Skills for Peer Supporters",
            "description": "Master effective listening and communication techniques",
            "duration_minutes": 60,
            "order": 4,
            "is_critical": False,
            "image_url": MODULE_IMAGES["m4-communication"],
            "content": """
## Communication Skills for Peer Supporters

Effective communication is the foundation of peer support. This module will teach you practical techniques to become a better listener and communicator.

---

## Active Listening

Active listening is more than just hearing words - it's fully engaging with the person and their message.

### The SOLER Model

**S** - Sit squarely facing the person
**O** - Open posture (uncrossed arms/legs)
**L** - Lean slightly toward them
**E** - Eye contact (appropriate, not staring)
**R** - Relax and be natural

### Verbal and Non-Verbal Skills

**Non-verbal:**
- Nodding appropriately
- Facial expressions that match the tone
- Open body language
- Appropriate eye contact
- Not looking at phone/watch

**Verbal:**
- "Mmm", "I see", "Go on"
- Brief affirmations
- Allowing pauses/silences
- Not interrupting

---

## Reflecting and Paraphrasing

Reflecting shows you're listening and helps the person feel understood.

### How to Reflect:

**Reflect feelings:**
- "It sounds like you're feeling really frustrated"
- "You seem quite anxious about this"
- "I'm hearing a lot of sadness in what you're saying"

**Paraphrase content:**
- "So what you're saying is..."
- "If I understand correctly..."
- "Let me make sure I've got this right..."

### Example:

**Person says:** "I've been applying for jobs for months and I keep getting rejected. I feel like I'm useless and I don't know what I'm going to do. My wife is getting fed up with me."

**Good reflection:** "It sounds like the job search has been really tough and it's affecting how you feel about yourself. You're also worried about how it's impacting things at home."

---

## Open vs Closed Questions

### Closed Questions
Get short, specific answers:
- "Did you sleep well?" → "No"
- "Are you feeling okay?" → "Yes/No"
- "How many hours did you work?" → "10"

**Use for:** Clarifying facts, checking understanding

### Open Questions
Encourage fuller responses:
- "How did that make you feel?"
- "Tell me more about what happened"
- "What's been on your mind?"
- "How are you coping with everything?"

**Use for:** Exploring feelings, understanding their perspective

### Powerful Open Questions:
- "What would help right now?"
- "What's the hardest part?"
- "What do you need most?"
- "How would things look if they improved?"

---

## Silence is Golden

Many people feel uncomfortable with silence and rush to fill it. But silence is powerful:

### Why Silence Matters:
- Gives them time to think
- Shows you're not rushing them
- Allows deeper feelings to emerge
- Demonstrates you're comfortable with difficult emotions

### How Long to Wait:
Count to 10 in your head before speaking. You'll be surprised how often they continue without prompting.

### What to Say After Silence:
- "Take your time"
- "There's no rush"
- Simply wait and maintain eye contact

---

## Empathy vs Sympathy

### Sympathy (Less Helpful)
- Feeling sorry for someone
- "Oh you poor thing"
- Can feel patronising
- Creates distance ("I feel bad FOR you")

### Empathy (More Helpful)
- Understanding their perspective
- "That sounds really difficult"
- Connects with their experience
- Creates closeness ("I feel WITH you")

### Empathic Responses:
- "I can understand why that would be hard"
- "It makes sense you'd feel that way"
- "Anyone going through this would struggle"
- "That sounds incredibly tough"

---

## Avoiding Communication Blocks

### Things That Block Communication:

**Giving advice too quickly:**
- "You should..." / "Why don't you..."
- Wait until they ask or are ready

**Minimising:**
- "It's not that bad" / "At least..."
- Their feelings are valid

**Changing the subject:**
- Stay with what they want to talk about
- Don't redirect to more comfortable topics

**Talking about yourself:**
- "That happened to me too and I..."
- Brief sharing can be helpful, but don't make it about you

**Judging:**
- "That was a mistake" / "You shouldn't have..."
- Accept without judging

**Reassuring too quickly:**
- "Everything will be fine"
- Let them express their worry first

---

## Sharing Your Own Experience

As a veteran peer supporter, you have lived experience that can be valuable. But share carefully.

### When to Share:
- When it will genuinely help them
- When they seem isolated ("am I the only one?")
- When it normalises their experience
- Brief moments, not long stories

### When NOT to Share:
- To make yourself feel better
- To one-up them
- When you're triggered by their story
- When it shifts focus from them to you

### How to Share:
- Keep it brief
- Return focus to them quickly
- "I remember feeling something similar when I came out. It does get easier." Then pause.

---

## Difficult Conversations

Some conversations will be hard. Here's how to handle them:

### When They're Angry:
- Stay calm
- Don't take it personally
- Validate: "I can hear you're really frustrated"
- Don't argue or defend

### When They're Crying:
- It's okay - let them cry
- Offer tissues if available
- Stay present, don't rush to fix
- "Take your time" or just sit with them

### When They're Silent:
- Don't panic
- Sit with the silence
- "We can sit here as long as you need"
- They may be processing

### When You Don't Know What to Say:
- Be honest: "I'm not sure what to say, but I'm here"
- You don't need to have answers
- Your presence is enough

---

## Further Reading

- **Skills for Health - Communication Skills**: https://www.skillsforhealth.org.uk/
- **Mind - Listening Skills**: https://www.mind.org.uk/workplace/mental-health-at-work/taking-care-of-your-staff/useful-resources/
- **Samaritans - Listening Tips**: https://www.samaritans.org/how-we-can-help/support-and-information/if-youre-having-difficult-time/top-listening-tips/

---

## Summary

This module covered:
- Active listening and the SOLER model
- Reflecting and paraphrasing techniques
- Using open vs closed questions effectively
- The power of silence
- Empathy vs sympathy
- Avoiding communication blocks
- Sharing your own experience appropriately
- Handling difficult conversations
            """,
            "external_links": [
                {"title": "Samaritans - Listening Tips", "url": "https://www.samaritans.org/how-we-can-help/support-and-information/if-youre-having-difficult-time/top-listening-tips/"},
                {"title": "Mind - Listening Skills", "url": "https://www.mind.org.uk/workplace/mental-health-at-work/"}
            ],
            "quiz": {
                "id": "q4-communication",
                "title": "Module 4 Quiz: Communication Skills",
                "pass_rate": 80,
                "questions": [
                    {
                        "id": "q4-1",
                        "type": "multiple_choice",
                        "question": "What does the 'L' in SOLER stand for?",
                        "options": [
                            "Look interested",
                            "Lean slightly forward",
                            "Listen carefully",
                            "Let them talk"
                        ],
                        "correct": "Lean slightly forward",
                        "explanation": "SOLER: Sit squarely, Open posture, Lean forward, Eye contact, Relax. Leaning forward shows engagement."
                    },
                    {
                        "id": "q4-2",
                        "type": "multiple_choice",
                        "question": "Which is an example of an OPEN question?",
                        "options": [
                            "Did you sleep well?",
                            "Are you feeling better?",
                            "How did that make you feel?",
                            "Do you want some help?"
                        ],
                        "correct": "How did that make you feel?",
                        "explanation": "Open questions encourage fuller responses and can't be answered with yes/no. 'How did that make you feel?' invites exploration."
                    },
                    {
                        "id": "q4-3",
                        "type": "true_false",
                        "question": "You should fill silences quickly to avoid awkwardness.",
                        "options": ["True", "False"],
                        "correct": "False",
                        "explanation": "Silence is valuable. It gives the person time to think and process. Count to 10 before speaking - they may continue without prompting."
                    },
                    {
                        "id": "q4-4",
                        "type": "scenario",
                        "question": "Someone says: 'I've been trying to find work for months. I feel completely worthless.' The BEST response is:",
                        "options": [
                            "'At least you have your health!'",
                            "'It sounds like the job search is really affecting how you feel about yourself.'",
                            "'When I was unemployed, I started a small business...'",
                            "'You just need to try harder and stay positive.'"
                        ],
                        "correct": "'It sounds like the job search is really affecting how you feel about yourself.'",
                        "explanation": "This response reflects their feelings and shows understanding. The others minimise, redirect to yourself, or give advice."
                    },
                    {
                        "id": "q4-5",
                        "type": "multiple_choice",
                        "question": "What's the difference between empathy and sympathy?",
                        "options": [
                            "They mean the same thing",
                            "Sympathy connects with them; empathy feels sorry for them",
                            "Empathy connects with their experience; sympathy feels sorry for them",
                            "Empathy is for friends; sympathy is for strangers"
                        ],
                        "correct": "Empathy connects with their experience; sympathy feels sorry for them",
                        "explanation": "Empathy means understanding and connecting WITH someone. Sympathy means feeling sorry FOR someone. Empathy is more helpful in peer support."
                    }
                ]
            }
        },
        
        # ===================================================================
        # MODULE 5: CRISIS SUPPORT (CRITICAL)
        # ===================================================================
        {
            "id": "m5-crisis",
            "title": "Crisis Support and Suicide Awareness",
            "description": "Recognising and responding to mental health crises - CRITICAL MODULE",
            "duration_minutes": 75,
            "order": 5,
            "is_critical": True,
            "image_url": MODULE_IMAGES["m5-crisis"],
            "content": """
## CRITICAL MODULE - 100% Pass Required

This module covers how to recognise and respond to mental health crises, including suicide risk. You must pass with 100%.

---

## What is a Mental Health Crisis?

A mental health crisis is when someone's mental health has deteriorated to a point where they need urgent support. They may be at risk of harming themselves or unable to cope with daily life.

### Signs of Crisis:
- Expressing thoughts of suicide or self-harm
- Severe panic or anxiety attacks
- Psychotic symptoms (hearing voices, paranoia)
- Severe depression (can't get out of bed, not eating)
- Severe alcohol/drug intoxication
- Dissociation (disconnected from reality)
- Extreme distress and unable to cope

---

## Understanding Suicide

### Facts About Suicide:
- Suicide is the biggest killer of men under 50 in the UK
- Veterans are at higher risk than the general population
- Most people who die by suicide have been in contact with services
- Suicide is preventable - intervention works
- Asking about suicide does NOT increase risk

### Veteran-Specific Risks:
- Transition period (leaving the military)
- Relationship breakdown
- Employment difficulties
- Physical health problems from service
- Trauma and moral injury
- Loss of identity and purpose
- Anniversary of traumatic events

---

## Warning Signs of Suicide

### Verbal Signs (What They Say):
- "I wish I wasn't here"
- "Everyone would be better off without me"
- "There's no point anymore"
- "I can't go on"
- "I want to end it all"
- "I've been thinking about death a lot"

### Behavioural Signs (What They Do):
- Giving away possessions
- Saying goodbye to people
- Putting affairs in order
- Increased alcohol/drug use
- Withdrawing from people
- Researching methods
- Stockpiling medication
- Writing a will or letters

### Emotional Signs:
- Hopelessness
- Feeling like a burden
- Extreme mood swings
- Sudden calmness after distress (may have made a decision)
- Anxiety and agitation
- Shame and guilt

---

## Asking About Suicide

### Why Ask?
- It does NOT plant the idea
- It opens the door for them to talk
- It can save lives
- It shows you take them seriously

### How to Ask:

**Start gently:**
- "I'm a bit worried about you. How are you feeling about life at the moment?"
- "You've been going through a lot. Have you had any thoughts of harming yourself?"

**Ask directly:**
- "Are you thinking about suicide?"
- "Are you having thoughts of ending your life?"

**If they say YES:**
- Stay calm
- Don't panic or overreact
- Thank them for telling you
- "I'm glad you told me. Let's talk about how to keep you safe."

---

## Assessing Suicide Risk

### Questions to Understand Risk:

**Do they have a plan?**
- "Have you thought about how you might do it?"
- Someone with a specific plan is at higher risk

**Do they have access to means?**
- "Do you have access to [method]?"
- Access to lethal means increases risk

**Have they set a time?**
- "Have you thought about when?"
- A specific timeframe indicates higher risk

**What's stopping them?**
- "What's kept you going so far?"
- Protective factors matter

### Risk Levels:

**Lower Risk:**
- Thoughts of death but no plan
- Strong protective factors (family, future plans)
- Willing to seek help
- No access to means

**Higher Risk:**
- Clear plan and method
- Access to means
- Few protective factors
- Previous attempts
- Hopelessness
- Refusing help

---

## What to Do in a Crisis

### If Someone is Suicidal But Not in Immediate Danger:

1. **Stay calm** - Your calmness helps them
2. **Listen** - Let them talk without judgment
3. **Ask about suicide** - Open and direct
4. **Don't promise confidentiality** - You may need to involve others
5. **Ask about safety** - "Are you safe right now?"
6. **Encourage help** - Offer to help them access services
7. **Remove means if safe** - Ask about access to methods
8. **Make a safety plan** - What will they do if feelings get worse?
9. **Follow up** - Check in with them

### If Someone is in Immediate Danger:

**CALL 999** if:
- They have hurt themselves
- They are about to hurt themselves
- They cannot be kept safe

**Do:**
- Stay with them (or get someone to)
- Remove means of harm if safe
- Call for help
- Keep them talking
- Stay calm

**Don't:**
- Leave them alone
- Promise to keep it secret
- Try to handle it alone

---

## Crisis Resources

### Emergency:
- **999** - Life-threatening emergency
- **NHS 111 Option 2** - Mental health crisis
- **A&E** - If they've harmed themselves

### Crisis Lines:
- **Samaritans**: 116 123 (24/7)
- **Veterans Crisis Line**: Text VETERAN to 85258
- **Combat Stress 24-hour Helpline**: 0800 138 1619
- **PAPYRUS (under 35)**: 0800 068 4141
- **CALM (men)**: 0800 585858

### Follow-up Support:
- **Op Courage**: 0300 323 0137
- **Veterans Gateway**: 0808 802 1212
- **GP** - For ongoing support

---

## Safety Planning

A safety plan is a personal plan for what to do when feelings of suicide arise.

### Safety Plan Components:

1. **Warning signs**: What tells me I'm struggling?
2. **Coping strategies**: What can I do myself?
3. **People to contact**: Who can I call?
4. **Professional support**: What services can I use?
5. **Making the environment safe**: How can I reduce access to means?
6. **Reasons to live**: What matters to me?

You can help someone create a safety plan, but encourage professional involvement too.

---

## Looking After Yourself

Supporting someone in crisis is hard. You need support too.

### After a Crisis Conversation:
- Debrief with Radio Check supervision
- Don't carry it alone
- Use self-care strategies
- Know that you did your best
- Seek support if you're struggling

### You Are NOT Responsible for Their Choices
As much as you want to help, you cannot control someone else's actions. If someone dies by suicide, it is not your fault.

---

## Further Reading

- **Samaritans - Supporting Someone**: https://www.samaritans.org/how-we-can-help/if-youre-worried-about-someone-else/
- **Zero Suicide Alliance Training**: https://www.zerosuicidealliance.com/training
- **NHS - Suicide Warning Signs**: https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/behaviours/help-for-suicidal-thoughts/
- **PAPYRUS - Suicide Prevention**: https://www.papyrus-uk.org/

---

## Summary

This critical module covered:
- Recognising mental health crises
- Understanding suicide risk in veterans
- Warning signs of suicide
- How to ask about suicide
- Assessing risk levels
- What to do in immediate danger
- Crisis resources and numbers
- Safety planning
- Looking after yourself
            """,
            "external_links": [
                {"title": "Samaritans - Supporting Someone", "url": "https://www.samaritans.org/how-we-can-help/if-youre-worried-about-someone-else/"},
                {"title": "Zero Suicide Alliance Training", "url": "https://www.zerosuicidealliance.com/training"},
                {"title": "NHS - Suicide Warning Signs", "url": "https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/behaviours/help-for-suicidal-thoughts/"},
                {"title": "PAPYRUS - Suicide Prevention", "url": "https://www.papyrus-uk.org/"}
            ],
            "quiz": {
                "id": "q5-crisis",
                "title": "Module 5 Quiz: Crisis Support (100% Required)",
                "pass_rate": 100,
                "questions": [
                    {
                        "id": "q5-1",
                        "type": "true_false",
                        "question": "Asking someone directly about suicide can plant the idea in their head.",
                        "options": ["True", "False"],
                        "correct": "False",
                        "explanation": "Research consistently shows that asking about suicide does NOT plant the idea. It can actually save lives by allowing the person to talk about what they're experiencing."
                    },
                    {
                        "id": "q5-2",
                        "type": "multiple_choice",
                        "question": "Which indicates HIGHER suicide risk?",
                        "options": [
                            "Thoughts of death but no specific plan",
                            "Strong family support and future plans",
                            "A specific plan, method, and timeframe",
                            "Willingness to talk to their GP"
                        ],
                        "correct": "A specific plan, method, and timeframe",
                        "explanation": "Having a specific plan, access to means, and a timeframe significantly increases risk. This requires urgent intervention."
                    },
                    {
                        "id": "q5-3",
                        "type": "multiple_choice",
                        "question": "If someone has hurt themselves or is about to, you should:",
                        "options": [
                            "Wait to see if they calm down",
                            "Call 999 immediately",
                            "Ask them to call their GP tomorrow",
                            "Keep it confidential as they asked"
                        ],
                        "correct": "Call 999 immediately",
                        "explanation": "Immediate danger requires immediate action. Call 999, stay with them, and break confidentiality to keep them safe."
                    },
                    {
                        "id": "q5-4",
                        "type": "multiple_choice",
                        "question": "The 24/7 mental health crisis line through NHS is:",
                        "options": [
                            "999",
                            "NHS 111 Option 2",
                            "101",
                            "08001234567"
                        ],
                        "correct": "NHS 111 Option 2",
                        "explanation": "NHS 111 Option 2 provides 24/7 access to mental health crisis support. 999 is for life-threatening emergencies."
                    },
                    {
                        "id": "q5-5",
                        "type": "multiple_choice",
                        "question": "Which is a WARNING sign that someone may be considering suicide?",
                        "options": [
                            "Making plans for the future",
                            "Giving away possessions and saying goodbye",
                            "Starting a new hobby",
                            "Asking about support services"
                        ],
                        "correct": "Giving away possessions and saying goodbye",
                        "explanation": "Giving away possessions and saying goodbye can indicate someone has made a decision about suicide and is 'putting affairs in order'. This is a serious warning sign."
                    }
                ]
            }
        },
        
        # ===================================================================
        # MODULE 6: UNDERSTANDING PTSD
        # ===================================================================
        {
            "id": "m6-ptsd",
            "title": "Understanding PTSD in Veterans",
            "description": "Recognising and supporting veterans with Post-Traumatic Stress Disorder",
            "duration_minutes": 60,
            "order": 6,
            "is_critical": False,
            "image_url": MODULE_IMAGES["m6-ptsd"],
            "content": """
## Understanding PTSD in Veterans

Post-Traumatic Stress Disorder (PTSD) is common among veterans. This module helps you understand what PTSD is, how it affects people, and how you can provide supportive peer support.

---

## What is PTSD?

PTSD is a mental health condition that can develop after experiencing or witnessing traumatic events. The brain's normal response to danger becomes stuck in 'survival mode'.

### Common Traumatic Events for Veterans:
- Combat and conflict
- Witnessing death or serious injury
- Being seriously injured
- Sexual assault or abuse
- Accidents and disasters
- Moral injury (acting against your values)
- Repeated exposure to trauma

### Important: Not Everyone Develops PTSD
Many people experience trauma and recover naturally. PTSD develops when the brain struggles to process the event and move forward.

---

## Symptoms of PTSD

PTSD symptoms fall into four main categories:

### 1. Re-experiencing
- **Flashbacks**: Reliving the event as if it's happening now
- **Nightmares**: Vivid, distressing dreams
- **Intrusive memories**: Unwanted memories that pop up
- **Physical reactions**: Racing heart, sweating when reminded

### 2. Avoidance
- Avoiding places, people, or situations that trigger memories
- Not wanting to talk about what happened
- Avoiding thoughts and feelings related to the trauma
- Emotional numbing - feeling disconnected

### 3. Negative Changes in Thinking and Mood
- Negative thoughts about self or the world ("I'm broken", "nowhere is safe")
- Memory problems (difficulty remembering parts of the trauma)
- Feeling detached from others
- Loss of interest in activities
- Difficulty feeling positive emotions
- Guilt and shame

### 4. Hyperarousal
- Being easily startled
- Constantly on alert (hypervigilance)
- Difficulty sleeping
- Irritability and anger outbursts
- Difficulty concentrating
- Reckless or self-destructive behaviour

---

## Complex PTSD

Some veterans may have Complex PTSD (C-PTSD), which develops from prolonged or repeated trauma.

### Additional Symptoms:
- Difficulty controlling emotions
- Feeling permanently damaged
- Feeling empty or hopeless
- Difficulty with relationships
- Dissociation (feeling disconnected from yourself)
- Physical symptoms

---

## Moral Injury

Moral injury is related to but different from PTSD. It occurs when someone does something, or fails to do something, that violates their moral code.

### Examples:
- Harming civilians, even accidentally
- Following orders you disagreed with
- Not being able to save someone
- Witnessing injustice
- Acting against your values to survive

### Symptoms:
- Intense guilt and shame
- Loss of trust in self and others
- Spiritual or existential crisis
- Anger at leadership or institutions
- Self-punishment

---

## Supporting Someone with PTSD

### DO:
- **Listen without judgment**: Let them share at their own pace
- **Validate their experience**: "That sounds incredibly difficult"
- **Be patient**: Recovery takes time
- **Learn their triggers**: Ask what helps and what doesn't
- **Encourage professional help**: PTSD benefits from treatment
- **Support their autonomy**: They make their own choices

### DON'T:
- **Ask for details of trauma**: Let them choose what to share
- **Minimise their experience**: "It could have been worse"
- **Tell them to 'move on'**: They would if they could
- **Be offended by avoidance**: It's not personal
- **Make sudden movements or loud noises**: Be aware of startle responses
- **Assume you know what they need**: Ask them

---

## Understanding Triggers

Triggers are things that remind someone of their trauma and can cause distress or flashbacks.

### Common Triggers:
- Loud noises (fireworks, bangs, helicopters)
- Crowds
- Certain smells (diesel, burning, gunpowder)
- News coverage of conflict
- Anniversaries of events
- Certain places or situations
- Feeling trapped or confined

### How to Help with Triggers:
- Learn what triggers them (if they're willing to share)
- Don't create unexpected triggers
- Give them control over their environment when possible
- If triggered, help ground them in the present

---

## Grounding Techniques

If someone is having a flashback or panic, grounding techniques can help bring them back to the present.

### 5-4-3-2-1 Technique:
Ask them to name:
- **5** things they can see
- **4** things they can touch
- **3** things they can hear
- **2** things they can smell
- **1** thing they can taste

### Other Grounding:
- "You're safe. You're at [location]. It's [date]."
- Hold something cold or textured
- Stamp feet on the ground
- Deep, slow breathing
- Focus on the present environment

---

## Treatment for PTSD

Encourage professional help. Effective treatments include:

### Evidence-Based Therapies:
- **EMDR** (Eye Movement Desensitisation and Reprocessing)
- **Trauma-focused CBT**
- **Prolonged Exposure Therapy**
- **Cognitive Processing Therapy**

### Veteran-Specific Services:
- **Op Courage**: NHS veteran mental health service
- **Combat Stress**: Specialist veteran PTSD charity
- **Help for Heroes**: Recovery programmes

### Medication:
Some people benefit from medication alongside therapy. This is a GP/psychiatrist decision.

---

## Further Reading

- **Combat Stress - Understanding PTSD**: https://combatstress.org.uk/ptsd
- **NHS - PTSD**: https://www.nhs.uk/mental-health/conditions/post-traumatic-stress-disorder-ptsd/
- **PTSD UK**: https://www.ptsduk.org/
- **Mind - PTSD and Trauma**: https://www.mind.org.uk/information-support/types-of-mental-health-problems/post-traumatic-stress-disorder-ptsd-and-complex-ptsd/

---

## Summary

This module covered:
- What PTSD is and how it develops
- The four symptom categories (re-experiencing, avoidance, negative changes, hyperarousal)
- Complex PTSD and moral injury
- How to support someone with PTSD
- Understanding and responding to triggers
- Grounding techniques for flashbacks
- Available treatments and services
            """,
            "external_links": [
                {"title": "Combat Stress - Understanding PTSD", "url": "https://combatstress.org.uk/ptsd"},
                {"title": "NHS - PTSD", "url": "https://www.nhs.uk/mental-health/conditions/post-traumatic-stress-disorder-ptsd/"},
                {"title": "PTSD UK", "url": "https://www.ptsduk.org/"},
                {"title": "Mind - PTSD and Trauma", "url": "https://www.mind.org.uk/information-support/types-of-mental-health-problems/post-traumatic-stress-disorder-ptsd-and-complex-ptsd/"}
            ],
            "quiz": {
                "id": "q6-ptsd",
                "title": "Module 6 Quiz: Understanding PTSD",
                "pass_rate": 80,
                "questions": [
                    {
                        "id": "q6-1",
                        "type": "multiple_choice",
                        "question": "Which is NOT one of the four main symptom categories of PTSD?",
                        "options": [
                            "Re-experiencing",
                            "Avoidance",
                            "Aggression",
                            "Hyperarousal"
                        ],
                        "correct": "Aggression",
                        "explanation": "The four categories are: Re-experiencing, Avoidance, Negative changes in thinking/mood, and Hyperarousal. Aggression can be a symptom within hyperarousal, but it's not a main category."
                    },
                    {
                        "id": "q6-2",
                        "type": "true_false",
                        "question": "Everyone who experiences trauma develops PTSD.",
                        "options": ["True", "False"],
                        "correct": "False",
                        "explanation": "Many people experience trauma and recover naturally. PTSD develops when the brain struggles to process the event. Most people are resilient."
                    },
                    {
                        "id": "q6-3",
                        "type": "multiple_choice",
                        "question": "If someone is having a flashback, you should:",
                        "options": [
                            "Shake them to snap them out of it",
                            "Ask them to tell you every detail of what they're seeing",
                            "Use grounding techniques to bring them to the present",
                            "Leave them alone until it passes"
                        ],
                        "correct": "Use grounding techniques to bring them to the present",
                        "explanation": "Grounding techniques like 5-4-3-2-1 help reconnect the person with the present moment. Don't shake them, demand details, or leave them unsupported."
                    },
                    {
                        "id": "q6-4",
                        "type": "multiple_choice",
                        "question": "Moral injury differs from PTSD in that it involves:",
                        "options": [
                            "Physical injury from combat",
                            "Acting against one's moral values or witnessing injustice",
                            "Injury to morality from reading bad news",
                            "An injury that affects your mood"
                        ],
                        "correct": "Acting against one's moral values or witnessing injustice",
                        "explanation": "Moral injury involves deep guilt and shame from doing or witnessing something that violated the person's moral code. It can co-occur with PTSD."
                    },
                    {
                        "id": "q6-5",
                        "type": "multiple_choice",
                        "question": "When supporting someone with PTSD, you should:",
                        "options": [
                            "Ask them to describe their trauma in detail",
                            "Tell them to just move on and forget about it",
                            "Listen without judgment and encourage professional help",
                            "Make sudden movements to test their reactions"
                        ],
                        "correct": "Listen without judgment and encourage professional help",
                        "explanation": "Supportive peer support means listening without pushing for details, validating their experience, and encouraging professional treatment. PTSD responds well to evidence-based treatments."
                    }
                ]
            }
        },
        
        # ===================================================================
        # MODULE 7: DEPRESSION AND ANXIETY
        # ===================================================================
        {
            "id": "m7-depression",
            "title": "Depression and Anxiety in Veterans",
            "description": "Understanding and supporting veterans with depression and anxiety disorders",
            "duration_minutes": 60,
            "order": 7,
            "is_critical": False,
            "image_url": MODULE_IMAGES["m7-depression"],
            "content": """
## Depression and Anxiety in Veterans

Depression and anxiety are the most common mental health conditions, affecting millions of people. Veterans are at higher risk due to their experiences. This module helps you understand these conditions and how to provide effective peer support.

---

## Understanding Depression

### What is Depression?
Depression is more than feeling sad or having a bad day. It's a persistent low mood that affects daily life.

**It IS:**
- A real medical condition
- Treatable
- Nobody's fault
- More than "just feeling sad"

**It is NOT:**
- A sign of weakness
- Something you can "snap out of"
- A character flaw
- Just having a bad day

---

### Symptoms of Depression

**Emotional Symptoms:**
- Persistent sadness or emptiness
- Feelings of hopelessness
- Guilt and worthlessness
- Loss of interest in things once enjoyed
- Feeling irritable or angry

**Physical Symptoms:**
- Fatigue and low energy
- Changes in sleep (too much or too little)
- Changes in appetite (eating more or less)
- Physical aches and pains
- Slowed movement or speech

**Cognitive Symptoms:**
- Difficulty concentrating
- Trouble making decisions
- Memory problems
- Negative thoughts about self and future
- Thoughts of death or suicide

---

### Veteran-Specific Depression

Veterans may experience depression differently:

- **Masked by anger**: Depression in men often shows as irritability
- **Related to transition**: Leaving military life is a huge change
- **Connected to identity**: Loss of purpose and belonging
- **Physical health links**: Chronic pain and injuries contribute
- **Delayed onset**: May appear years after service

---

## Understanding Anxiety

### What is Anxiety?
Anxiety is the body's natural response to perceived threat. It becomes a problem when it's excessive, persistent, or interferes with life.

### Types of Anxiety:
- **Generalised Anxiety Disorder (GAD)**: Constant worry about many things
- **Panic Disorder**: Sudden, intense fear (panic attacks)
- **Social Anxiety**: Fear of social situations and judgment
- **Phobias**: Intense fear of specific things
- **Health Anxiety**: Excessive worry about illness

---

### Symptoms of Anxiety

**Physical:**
- Racing heart
- Rapid breathing
- Sweating
- Trembling
- Stomach problems
- Muscle tension
- Dizziness

**Psychological:**
- Constant worry
- Feeling on edge
- Sense of dread
- Difficulty concentrating
- Irritability
- Difficulty sleeping

**Behavioural:**
- Avoidance of feared situations
- Seeking constant reassurance
- Restlessness
- Difficulty relaxing

---

### Panic Attacks

A panic attack is a sudden surge of intense fear with physical symptoms. It can feel like dying or losing control.

**Symptoms:**
- Racing/pounding heart
- Chest pain
- Difficulty breathing
- Dizziness
- Feeling unreal
- Fear of dying
- Numbness/tingling

**Important:** Panic attacks are terrifying but not dangerous. They pass.

---

## Supporting Someone with Depression

### DO:
- **Check in regularly**: Even brief contact matters
- **Listen without judgment**: Let them express how they feel
- **Acknowledge their pain**: "That sounds really hard"
- **Offer practical help**: Cooking a meal, running an errand
- **Encourage small steps**: Not overwhelming goals
- **Be patient**: Depression doesn't lift quickly
- **Encourage professional help**: Treatment works

### DON'T:
- Say "cheer up" or "think positive"
- Tell them others have it worse
- Take their withdrawal personally
- Push them too hard
- Get frustrated with their pace
- Promise you can fix them

### Helpful Things to Say:
- "I'm here for you, whatever you need"
- "You don't have to face this alone"
- "It's okay to feel this way"
- "What would help right now?"
- "I'll check in again tomorrow"

---

## Supporting Someone with Anxiety

### DO:
- **Stay calm yourself**: Your calm helps them
- **Validate their feelings**: "It's okay to feel anxious"
- **Help with breathing**: Slow, deep breaths together
- **Ground them in the present**: 5-4-3-2-1 technique
- **Don't feed the anxiety**: Don't agree the worst will happen
- **Encourage facing fears gradually**: With professional support

### DON'T:
- Say "just calm down" or "there's nothing to worry about"
- Force them into feared situations suddenly
- Get impatient
- Dismiss their fears as irrational
- Enable avoidance completely

### During a Panic Attack:
1. Stay calm and stay with them
2. Reassure them it will pass
3. Help with slow breathing
4. Ground them in the present
5. Don't rush them
6. When it passes, be gentle

---

## Treatment Options

### For Depression:
- **Talking therapies**: CBT, counselling, interpersonal therapy
- **Medication**: Antidepressants (GP/psychiatrist prescribed)
- **Exercise**: Proven to help mild-moderate depression
- **Peer support**: Groups and one-to-one
- **Self-help**: Books, apps, online programmes

### For Anxiety:
- **CBT**: Particularly effective for anxiety
- **Exposure therapy**: Gradual facing of fears
- **Medication**: For some people, short or long-term
- **Relaxation techniques**: Breathing, mindfulness
- **Self-help**: Many good resources available

### Veteran Services:
- **Op Courage**: NHS veteran mental health
- **IAPT**: NHS talking therapies
- **Combat Stress**: Veteran charity
- **Big White Wall**: Online peer support
- **Walking with the Wounded**: Programmes for veterans

---

## Further Reading

- **Mind - Depression**: https://www.mind.org.uk/information-support/types-of-mental-health-problems/depression/
- **Mind - Anxiety and Panic Attacks**: https://www.mind.org.uk/information-support/types-of-mental-health-problems/anxiety-and-panic-attacks/
- **NHS - Depression**: https://www.nhs.uk/mental-health/conditions/depression-in-adults/overview/
- **Anxiety UK**: https://www.anxietyuk.org.uk/

---

## Summary

This module covered:
- What depression is and its symptoms
- Understanding anxiety and panic attacks
- How these conditions affect veterans specifically
- How to support someone with depression
- How to help someone with anxiety and panic attacks
- Available treatment options and services
            """,
            "external_links": [
                {"title": "Mind - Depression", "url": "https://www.mind.org.uk/information-support/types-of-mental-health-problems/depression/"},
                {"title": "Mind - Anxiety", "url": "https://www.mind.org.uk/information-support/types-of-mental-health-problems/anxiety-and-panic-attacks/"},
                {"title": "NHS - Depression", "url": "https://www.nhs.uk/mental-health/conditions/depression-in-adults/overview/"},
                {"title": "Anxiety UK", "url": "https://www.anxietyuk.org.uk/"}
            ],
            "quiz": {
                "id": "q7-depression",
                "title": "Module 7 Quiz: Depression and Anxiety",
                "pass_rate": 80,
                "questions": [
                    {
                        "id": "q7-1",
                        "type": "true_false",
                        "question": "Depression in veterans often shows as anger and irritability rather than sadness.",
                        "options": ["True", "False"],
                        "correct": "True",
                        "explanation": "Depression in men, including veterans, often manifests as irritability and anger rather than the sadness typically associated with depression. This is sometimes called 'masked depression'."
                    },
                    {
                        "id": "q7-2",
                        "type": "multiple_choice",
                        "question": "Which is NOT an effective way to support someone with depression?",
                        "options": [
                            "Checking in regularly",
                            "Telling them to think positive and cheer up",
                            "Acknowledging their pain",
                            "Encouraging professional help"
                        ],
                        "correct": "Telling them to think positive and cheer up",
                        "explanation": "'Think positive' and 'cheer up' dismiss the person's real struggle. If they could just think positive, they would. Depression is a medical condition, not a choice."
                    },
                    {
                        "id": "q7-3",
                        "type": "multiple_choice",
                        "question": "During a panic attack, you should:",
                        "options": [
                            "Tell them there's nothing to worry about",
                            "Leave them alone to calm down",
                            "Stay calm, help with slow breathing, and reassure them it will pass",
                            "Call 999 immediately"
                        ],
                        "correct": "Stay calm, help with slow breathing, and reassure them it will pass",
                        "explanation": "Panic attacks are frightening but not dangerous. Stay calm, help with breathing, reassure them it will pass, and don't rush or dismiss their experience."
                    },
                    {
                        "id": "q7-4",
                        "type": "multiple_choice",
                        "question": "What is Generalised Anxiety Disorder (GAD)?",
                        "options": [
                            "Fear of specific objects like spiders",
                            "Constant worry about many different things",
                            "Fear of social situations",
                            "Sudden panic attacks"
                        ],
                        "correct": "Constant worry about many different things",
                        "explanation": "GAD involves persistent, excessive worry about many different areas of life - work, health, family, etc. - that's difficult to control."
                    },
                    {
                        "id": "q7-5",
                        "type": "multiple_choice",
                        "question": "What treatment is particularly effective for anxiety disorders?",
                        "options": [
                            "Avoiding all stressful situations",
                            "Cognitive Behavioural Therapy (CBT)",
                            "Only medication, no talking therapy",
                            "Just exercise alone"
                        ],
                        "correct": "Cognitive Behavioural Therapy (CBT)",
                        "explanation": "CBT is an evidence-based treatment that's particularly effective for anxiety. It helps people change unhelpful thought patterns and gradually face their fears."
                    }
                ]
            }
        },
        
        # ===================================================================
        # MODULE 8: SELF-CARE FOR PEER SUPPORTERS
        # ===================================================================
        {
            "id": "m8-selfcare",
            "title": "Self-Care for Peer Supporters",
            "description": "Looking after your own wellbeing while supporting others",
            "duration_minutes": 60,
            "order": 8,
            "is_critical": False,
            "image_url": MODULE_IMAGES["m8-selfcare"],
            "content": """
## Self-Care for Peer Supporters

Supporting others with their mental health is rewarding but demanding. This module focuses on looking after yourself so you can continue to help others effectively.

---

## Why Self-Care Matters

### The Oxygen Mask Principle
On a plane, you're told to put on your own oxygen mask before helping others. The same applies to peer support. You cannot pour from an empty cup.

### What Happens Without Self-Care:
- Burnout
- Compassion fatigue
- Secondary traumatic stress
- Poor quality support
- Your own mental health suffering
- Leaving the role entirely

---

## Understanding Burnout

### What is Burnout?
Burnout is physical and emotional exhaustion from prolonged stress. It develops gradually.

### Signs of Burnout:
- Feeling emotionally drained
- Losing motivation
- Feeling ineffective
- Cynicism about the work
- Dreading support sessions
- Constant fatigue
- Physical health problems
- Withdrawing from others

### Risk Factors for Peer Supporters:
- Taking on too much
- Poor boundaries
- Not seeking support yourself
- High expectations of yourself
- Difficult cases
- Lack of training or supervision

---

## Compassion Fatigue

### What is Compassion Fatigue?
Also called 'secondary traumatic stress', this occurs when repeatedly hearing about others' trauma affects your own wellbeing.

### Signs:
- Nightmares about what you've heard
- Intrusive thoughts
- Feeling hopeless about the world
- Difficulty separating work from personal life
- Becoming emotionally numb
- Hypervigilance
- Avoidance

### Why Veteran Peer Supporters Are at Risk:
- You may have your own trauma history
- Stories may trigger your own experiences
- Strong identification with those you support
- Desire to help can override self-protection

---

## Practical Self-Care Strategies

### Physical Self-Care:
- Regular exercise (even walking)
- Adequate sleep
- Healthy eating
- Limiting alcohol
- Regular health check-ups
- Time outdoors

### Emotional Self-Care:
- Acknowledging your feelings
- Journaling
- Creative activities
- Allowing yourself to have fun
- Setting boundaries
- Saying no when needed

### Social Self-Care:
- Maintaining friendships outside peer support
- Spending time with family
- Asking for help when needed
- Connection with other veterans
- Avoiding isolation

### Professional Self-Care:
- Regular supervision/debriefs
- Continuing training
- Clear boundaries with those you support
- Not taking on too many people
- Taking breaks between sessions
- Celebrating successes

---

## Supervision and Support

### Why Supervision Matters:
- Helps process difficult sessions
- Ensures you're working safely
- Identifies when you need support
- Develops your skills
- Prevents isolation
- Required by Radio Check

### How to Use Supervision Well:
- Be honest about how you're feeling
- Bring difficult cases
- Ask for feedback
- Share successes too
- Don't pretend everything is fine

### When to Seek Extra Support:
- After a crisis situation
- If you're being triggered by content
- When feeling overwhelmed
- If your own mental health is suffering
- Before it becomes a crisis

---

## Setting Boundaries

### Boundaries Protect Both You and Them

**Time Boundaries:**
- Agreed contact times only
- Not available 24/7
- Taking time off
- Ending sessions on time

**Emotional Boundaries:**
- Not taking their problems home
- Separating their feelings from yours
- Not becoming their only support
- Maintaining your own identity

**Content Boundaries:**
- Not needing to know every detail
- Knowing when to refer
- Not working beyond your competence

### How to Maintain Boundaries:
- Be clear from the start
- Remind gently when needed
- Don't feel guilty
- Get support if boundaries are challenged
- Remember: boundaries help them too

---

## After Difficult Sessions

### Immediate Self-Care:
- Take a break before the next activity
- Deep breathing
- Brief walk or movement
- Cup of tea
- Debrief with supervisor if needed

### Processing What You've Heard:
- Journaling (without identifying details)
- Talking to your supervisor
- Physical activity
- Creative outlets
- NOT ruminating or googling

### What NOT to Do:
- Don't carry it alone
- Don't bottle it up
- Don't use alcohol to cope
- Don't rush into the next thing
- Don't feel you have to "be strong"

---

## Knowing Your Limits

### Signs You Need a Break:
- Dreading support sessions
- Feeling resentful
- Your own mental health suffering
- Intrusive thoughts about cases
- Difficulty sleeping
- Using unhealthy coping mechanisms

### It's Okay to:
- Take a break from peer support
- Reduce how many people you support
- Say you can't take on someone new
- Ask for help
- Admit you're struggling

**Asking for help is a strength, not a weakness.**

---

## Resources for Peer Supporters

### If You're Struggling:
- **Radio Check Supervision Team**: Your first point of contact
- **Op Courage**: 0300 323 0137
- **Combat Stress 24-hour Line**: 0800 138 1619
- **Samaritans**: 116 123
- **Mind**: 0300 123 3393

### Self-Care Resources:
- **NHS Every Mind Matters**: https://www.nhs.uk/every-mind-matters/
- **Headspace App**: Meditation and mindfulness
- **Mind - Self-Care**: https://www.mind.org.uk/information-support/types-of-mental-health-problems/self-care/

---

## Summary

This module covered:
- Why self-care is essential for peer supporters
- Understanding burnout and compassion fatigue
- Practical self-care strategies (physical, emotional, social, professional)
- The importance of supervision
- Setting and maintaining boundaries
- Caring for yourself after difficult sessions
- Knowing when you need support yourself
            """,
            "external_links": [
                {"title": "NHS Every Mind Matters", "url": "https://www.nhs.uk/every-mind-matters/"},
                {"title": "Mind - Self-Care", "url": "https://www.mind.org.uk/information-support/types-of-mental-health-problems/self-care/"},
                {"title": "Combat Stress 24-hour Line", "url": "https://combatstress.org.uk/get-help"}
            ],
            "quiz": {
                "id": "q8-selfcare",
                "title": "Module 8 Quiz: Self-Care for Peer Supporters",
                "pass_rate": 80,
                "questions": [
                    {
                        "id": "q8-1",
                        "type": "multiple_choice",
                        "question": "Compassion fatigue is best described as:",
                        "options": [
                            "Being tired of being compassionate",
                            "The emotional impact of repeatedly hearing about others' trauma",
                            "Not caring about people anymore",
                            "A sign you should quit peer support"
                        ],
                        "correct": "The emotional impact of repeatedly hearing about others' trauma",
                        "explanation": "Compassion fatigue (or secondary traumatic stress) is the emotional toll of being repeatedly exposed to others' trauma. It's common in helping roles and can be managed with proper self-care."
                    },
                    {
                        "id": "q8-2",
                        "type": "true_false",
                        "question": "As a peer supporter, you should be available 24/7 to show your commitment.",
                        "options": ["True", "False"],
                        "correct": "False",
                        "explanation": "Being available 24/7 leads to burnout and creates unhealthy dependency. Clear boundaries about availability protect both you and the person you support."
                    },
                    {
                        "id": "q8-3",
                        "type": "multiple_choice",
                        "question": "What should you do after a particularly difficult support session?",
                        "options": [
                            "Push through to the next task immediately",
                            "Use alcohol to relax",
                            "Take a break, use self-care strategies, and consider debriefing with supervision",
                            "Keep it to yourself to remain professional"
                        ],
                        "correct": "Take a break, use self-care strategies, and consider debriefing with supervision",
                        "explanation": "Processing difficult sessions is important. Take a break, use healthy coping strategies, and use supervision. Don't bottle it up or use unhealthy coping mechanisms."
                    },
                    {
                        "id": "q8-4",
                        "type": "multiple_choice",
                        "question": "Which is a sign of burnout?",
                        "options": [
                            "Feeling energised by support sessions",
                            "Looking forward to helping people",
                            "Feeling emotionally drained and losing motivation",
                            "Finding meaning in the work"
                        ],
                        "correct": "Feeling emotionally drained and losing motivation",
                        "explanation": "Emotional exhaustion and loss of motivation are key signs of burnout. Recognising these signs early allows you to take action before it becomes severe."
                    },
                    {
                        "id": "q8-5",
                        "type": "multiple_choice",
                        "question": "Why is supervision important for peer supporters?",
                        "options": [
                            "To check you're doing everything perfectly",
                            "To process difficult cases and ensure you're working safely",
                            "To criticise your performance",
                            "It's not important - you can manage alone"
                        ],
                        "correct": "To process difficult cases and ensure you're working safely",
                        "explanation": "Supervision provides support, helps process difficult content, develops skills, and ensures safe practice. It's not about criticism - it's about support and development."
                    }
                ]
            }
        }
    ]
}
