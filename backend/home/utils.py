import requests
from bs4 import BeautifulSoup
import time
import pandas as pd
import os
import tempfile
from docx import Document
from reportlab.pdfgen import canvas
import tempfile
import os
from docx2pdf import convert

def Get_URL_Of_page(base_url, skill):
    return f"{base_url}/internships/{skill}-internship"


def extract_job_title_from_result(job_div, job_post):
    try:
        job_title_tag = job_div.find("h3", class_="job-internship-name")
        job_title = job_title_tag.find("a").get_text(strip=True) if job_title_tag else "Job Title not available"
        job_post.append(job_title)
    except Exception as e:
        print(f"Error extracting job title: {e}")
        job_post.append("Job Title not available")


def extract_company_from_result(job_div, job_post):
    try:
        company_name_tag = job_div.find("p", class_="company-name")
        company_name = company_name_tag.get_text(strip=True) if company_name_tag else "Company Name not available"
        job_post.append(company_name)
    except Exception as e:
        print(f"Error extracting company: {e}")
        job_post.append("Company Name not available")


def extract_location_from_result(job_div, job_post):
    try:
        location_div = job_div.find("div", class_="row-1-item locations")
        if location_div:
            city = location_div.find("a").get_text(strip=True) if location_div.find("a") else "Location not specified"
            mode = location_div.find("span").get_text(strip=True) if location_div.find("span") else ""
            job_post.append(f"{city}".strip())
        else:
            job_post.append("Location not available")
    except Exception as e:
        print(f"Error extracting location: {e}")
        job_post.append("Location not available")


def extract_salary_from_result(job_div, job_post):
    try:
        salary_tag = job_div.find("span", class_="stipend")
        job_post.append(salary_tag.get_text(strip=True) if salary_tag else "Salary not specified")
    except Exception as e:
        print(f"Error extracting salary: {e}")
        job_post.append("Salary not specified")


def extract_internship_link(job_div, base_url, job_post):
    try:
        relative_url = job_div.get("data-href")
        job_post.append(f"{base_url}{relative_url}" if relative_url else "Link not available")
    except Exception as e:
        print(f"Error extracting internship link: {e}")
        job_post.append("Link not available")


def Get_total_pages(url):
    page = requests.get(url)
    soup = BeautifulSoup(page.text, "html.parser")
    pagination = soup.find("div", class_="pagination")

    if pagination:
        pages = pagination.find_all("a")
        return int(pages[-2].text) if pages else 1
    return 1


def Scrap_Internshala(base_url, skill):
    url = Get_URL_Of_page(base_url, skill)
    total_pages = Get_total_pages(url)
    columns = ["job_title", "company_name", "location", "salary", "link"]
    sample_df = pd.DataFrame(columns=columns)

    for page_number in range(total_pages):
        page = requests.get(f"{url}/page-{page_number + 1}")
        time.sleep(1)
        soup = BeautifulSoup(page.text, "html.parser")

        for div in soup.find_all("div", class_="individual_internship"):
            job_post = []

            extract_job_title_from_result(div, job_post)
            extract_company_from_result(div, job_post)
            extract_location_from_result(div, job_post)
            extract_salary_from_result(div, job_post)
            extract_internship_link(div, base_url, job_post)

            # Ensure job_post has exactly 5 elements
            job_post = job_post[:len(columns)]  # Trim extra elements
            while len(job_post) < len(columns):
                job_post.append("N/A")  # Fill missing elements

            sample_df.loc[len(sample_df)] = job_post

    return sample_df


def get_jobs_url(base_url, skill):
    """Generate the URL to search jobs based on skill."""
    return f"{base_url}/jobs/{skill}-jobs"


def extract_job_title(job_div, job_post):
    try:
        job_title_tag = job_div.find("h3", class_="job-internship-name")
        job_title = job_title_tag.find("a").get_text(strip=True) if job_title_tag else "Job Title not available"
        job_post.append(job_title)
    except Exception as e:
        print(f"Error extracting job title: {e}")
        job_post.append("Job Title not available")


def extract_company_name(job_div, job_post):
    try:
        company_name_tag = job_div.find("p", class_="company-name")
        company_name = company_name_tag.get_text(strip=True) if company_name_tag else "Company Name not available"
        job_post.append(company_name)
    except Exception as e:
        print(f"Error extracting company: {e}")
        job_post.append("Company Name not available")


def extract_location(job_div, job_post):
    try:
        location_div = job_div.find("p", class_="row-1-item locations")
        if location_div:
            city = location_div.find("a").get_text(strip=True) if location_div.find("a") else ""
            mode = location_div.find("span").get_text(strip=True) if location_div.find("span") else ""
            location = f"{city}" if city and mode else city or mode  
            job_post.append(location.strip() if location else "Location not specified")
        else:
            job_post.append("Location not available")
    except Exception as e:
        print(f"Error extracting location: {e}")
        job_post.append("Location not available")




def extract_salary(job_div, job_post):
    try:
        salary_span = job_div.find("i", class_="ic-16-money")  
        if salary_span:
            salary_text = salary_span.find_next_sibling("span").get_text(strip=True)  
            job_post.append(salary_text if salary_text else "Salary not specified")
        else:
            job_post.append("Salary not available")
    except Exception as e:
        print(f"Error extracting salary: {e}/year")
        job_post.append("Salary not available")



def extract_job_link(job_div, base_url, job_post):
    try:
        relative_url = job_div.get("data-href")
        job_post.append(f"{base_url}{relative_url}" if relative_url else "Link not available")
    except Exception as e:
        print(f"Error extracting job link: {e}")
        job_post.append("Link not available")


def get_total_pages(url):
    """Find the total number of pages in the job listing."""
    page = requests.get(url)
    soup = BeautifulSoup(page.text, "html.parser")
    pagination = soup.find("div", class_="pagination")

    if pagination:
        pages = pagination.find_all("a")
        return int(pages[-2].text) if pages else 1
    return 1


def scrap_jobs(base_url, skill):
    """Scrape jobs from Internshala based on the skill provided."""
    url = get_jobs_url(base_url, skill)
    total_pages = get_total_pages(url)
    columns = ["Job_Title", "Company_Name", "Locations", "Salary", "Job_Link"]
    jobs_df = pd.DataFrame(columns=columns)

    for page_number in range(total_pages):
        page = requests.get(f"{url}/page-{page_number + 1}")
        time.sleep(1)
        soup = BeautifulSoup(page.text, "html.parser")

        for div in soup.find_all("div", class_="individual_internship"):
            job_post = []

            extract_job_title(div, job_post)
            extract_company_name(div, job_post)
            extract_location(div, job_post)
            extract_salary(div, job_post)
            extract_job_link(div, base_url, job_post)

         
            job_post = job_post[:len(columns)]
            while len(job_post) < len(columns):
                job_post.append("N/A")

            jobs_df.loc[len(jobs_df)] = job_post

    return jobs_df


#KaustubhSen

def convert_docx_to_pdf(file):
    """
    Converts a DOCX file to PDF using python-docx and ReportLab.
    This method extracts text and formats it into a simple PDF.
    """
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save the uploaded DOCX file temporarily
            temp_docx_path = os.path.join(temp_dir, "uploaded.docx")
            with open(temp_docx_path, "wb") as temp_docx:
                temp_docx.write(file.read())

            # Read DOCX content
            doc = Document(temp_docx_path)
            text_content = "\n".join([para.text for para in doc.paragraphs])

            # Convert to PDF
            temp_pdf_path = os.path.join(temp_dir, "converted.pdf")
            c = canvas.Canvas(temp_pdf_path)
            c.drawString(100, 800, text_content)  # Adjust position as needed
            c.save()

            # Read the generated PDF and return as binary data
            with open(temp_pdf_path, "rb") as temp_pdf:
                pdf_content = temp_pdf.read()

        return pdf_content
    except Exception as e:
        raise Exception(f"Error processing DOCX file: {str(e)}")