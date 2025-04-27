import json
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from typing import Dict, Any


def analyze_emr_history(emr_text: str) -> dict:
    """
    This function analyzes a patient's EMR (Electronic Medical Record) history using a Langchain-powered LLM
    and returns a structured JSON breakdown of the patient's medical conditions, categorized by body systems
    and specific diagnoses or findings.

    Parameters:
    - emr_text (str): The full textual EMR history of the patient.

    Returns:
    - dict: A JSON-style dictionary structured by body systems and conditions
    """
    # Initialize the LLM
    llm = ChatOpenAI(model_name="gpt-4o", temperature=0)

    # Create the prompt template
    prompt_template = PromptTemplate(
        input_variables=["emr_text"],
        template="""
You are a medical AI assistant. Your task is to read the following EMR (Electronic Medical Record) history
and return a structured breakdown of the patient's health information in JSON format.

Group information under major categories such as:
- Heart
- Lungs
- Kidneys
- Diabetes
- Allergies
- Neurological
- Musculoskeletal
- Gastrointestinal
- Mental Health
- Medications
- Surgical History

Under each category, list specific conditions, diagnoses, or observations with a short explanation or summary.
Do not include categories that don't have any information in the EMR.
Ensure your response is valid JSON format that can be parsed.

EMR History:
{emr_text}

Output JSON:
"""
    )

    # Connect with LLMChain
    llm_chain = LLMChain(llm=llm, prompt=prompt_template)
    
    try:
        response = llm_chain.run({"emr_text": emr_text})
        # Clean response to ensure it's valid JSON
        response = response.strip()
        # Handle case where response might contain markdown code block indicators
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0].strip()
        elif "```" in response:
            response = response.split("```")[1].strip()
            
        return json.loads(response)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        print(f"Raw response: {response}")
        return {"error": "Failed to parse EMR into structured format"}


# Example usage
if __name__ == "__main__":
    patient_emr_text = """
    The patient is a 57-year-old male with a history of hypertension, chronic atrial fibrillation, and Type 2 diabetes.
    He is currently on metformin and atenolol. Recent ECG shows irregular rhythm. HbA1c is 8.4%.
    No known drug allergies except mild rash to penicillin in childhood.
    """
    
    result = analyze_emr_history(patient_emr_text)
    print(json.dumps(result, indent=2))