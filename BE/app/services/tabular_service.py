from typing import Dict, List
import pandas as pd
import json
from io import BytesIO, StringIO
from app.models.tabular import TabularData
from app import db
import numpy as np


class TabularService:
    @staticmethod
    def process_csv(file_content):
        """ Process CSV and return JSON data """
        df = pd.read_csv(StringIO(file_content))
        return df.to_json(orient="records")
    
    @staticmethod
    def compute_statistics(data: List[Dict]) -> Dict:
        """Compute comprehensive statistics on tabular data"""
        df = pd.DataFrame(data)
        df_numeric = df.select_dtypes(include=['number'])
        
        if 'id' in df_numeric.columns:
            df_numeric = df_numeric.drop(columns=['id'])
        
        stats_dict = {
            "basic_stats": {
                "mean": df_numeric.mean().to_dict(),
                "median": df_numeric.median().to_dict(),
                "std": df_numeric.std().to_dict(),
                "mode": df_numeric.mode().iloc[0].to_dict() if not df_numeric.mode().empty else {},
            },
            "quartiles": {
                col: {
                    "q1": df_numeric[col].quantile(0.25),
                    "q2": df_numeric[col].quantile(0.50),
                    "q3": df_numeric[col].quantile(0.75),
                } for col in df_numeric.columns
            },
            "outliers": {
                col: TabularService.get_outliers(df_numeric[col])
                for col in df_numeric.columns
            },
            "correlation_matrix": df_numeric.corr().to_dict(),
            "skewness": df_numeric.skew().to_dict(),
            "kurtosis": df_numeric.kurtosis().to_dict()
        }
        return stats_dict
        
    @staticmethod
    def save_tabular_data(filename, json_data):
        """ Save data into the database """
        data_entry = TabularData(filename=filename, data=json.loads(json_data))
        db.session.add(data_entry)
        db.session.commit()
        return data_entry.id

    @staticmethod
    def get_tabular_data(data_id):
        """ Retrieve a dataset by ID """
        return TabularData.query.get(data_id)

    @staticmethod
    def delete_tabular_data(data_id):
        """ Delete a dataset """
        data_entry = TabularData.query.get(data_id)
        if data_entry:
            db.session.delete(data_entry)
            db.session.commit()
            return True
        return False

    @staticmethod
    def update_tabular_data(data_id, filename, json_data):
        """ Update existing tabular data in the database """
        data_entry = TabularData.query.get(data_id)
        if not data_entry:
            return None

        # Update fields
        data_entry.filename = filename
        data_entry.data = json.loads(json_data)
        db.session.commit()
        return data_entry

    @staticmethod
    def download_file_by_id(data_id, file_format=None):
        """ Retrieve the dataset by ID and convert it to CSV or XLSX """
        data_entry = TabularData.query.get(data_id)
        if not data_entry:
            return None  # Return None if the dataset does not exist

        # Convert the stored JSON data back to a DataFrame
        df = pd.DataFrame(data_entry.data)
        
        # If file_format is provided, it will override the stored file extension
        if file_format == 'xlsx':
            output = BytesIO()
            df.to_excel(output, index=False, engine="openpyxl")
            output.seek(0)

            # Ensure the file extension is .xlsx and MIME type is correct
            filename = f"{data_entry.filename.split('.')[0]}.xlsx"  # Change extension if needed
            return output, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename
        else:
            # Default to CSV format
            output = BytesIO()
            df.to_csv(output, index=False)
            output.seek(0)
            return output, 'text/csv', data_entry.filename

    @staticmethod
    def process_file(file_content: bytes, file_type: str) -> str:
        """Process CSV or Excel files and return JSON data or an error message"""
        try:
            if file_type == 'csv':
                df = pd.read_csv(BytesIO(file_content), encoding="utf-8", on_bad_lines="error")
            elif file_type == 'excel':
                df = pd.read_excel(BytesIO(file_content))
            else:
                raise ValueError(f"Unsupported file type: {file_type}")

            # Basic data cleaning
            df = df.replace([np.inf, -np.inf], np.nan)
            df = df.ffill()  # Forward fill to handle NaN values

            return df.to_json(orient="records") 

        except UnicodeDecodeError:
            return json.dumps({"error": "File encoding error. Please upload a UTF-8 encoded file."}) 
        
        except pd.errors.ParserError:
            return json.dumps({"error": "Malformed CSV file. Please check the file content and structure."})

        except Exception as e:
            return json.dumps({"error": f"Error processing file: {str(e)}"})
        
    @staticmethod
    def get_outliers(series: pd.Series) -> Dict:
            """Identify outliers using IQR method"""
            Q1 = series.quantile(0.25)
            Q3 = series.quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            outliers = series[(series < lower_bound) | (series > upper_bound)]
            return {
                "values": outliers.tolist(),
                "count": len(outliers),
                "lower_bound": lower_bound,
                "upper_bound": upper_bound
            }
    @staticmethod
    def get_visualization_data(data_id: int) -> Dict:
        """Generate visualization data"""
        data_entry = TabularData.query.get(data_id)
        if not data_entry:
            return None
            
        df = pd.DataFrame(data_entry.data)
        df_numeric = df.select_dtypes(include=['number'])
        
        if 'id' in df_numeric.columns:
            df_numeric = df_numeric.drop(columns=['id'])
        
        return {
            "histogram_data": {
                col: {
                    "values": df_numeric[col].tolist(),
                    "bins": np.histogram(df_numeric[col], bins='auto')[0].tolist()
                } for col in df_numeric.columns
            },
            "boxplot_data": {
                col: {
                    "q1": float(df_numeric[col].quantile(0.25)),
                    "median": float(df_numeric[col].median()),
                    "q3": float(df_numeric[col].quantile(0.75)),
                    "whiskers": [
                        float(df_numeric[col].min()),
                        float(df_numeric[col].max())
                    ]
                } for col in df_numeric.columns
            },
            "correlation_heatmap": df_numeric.corr().to_dict()
        }

    @staticmethod
    def get_all_files() -> List[Dict]:
            """Get all files' basic information"""
            files = TabularData.query.all()
            return [{
                'id': file.id,
                'filename': file.filename,
                'uploaded_at': file.uploaded_at.isoformat(),
                'columns': list(pd.DataFrame(file.data).columns)
            } for file in files]