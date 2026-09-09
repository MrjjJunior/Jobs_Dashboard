with open('backend/database.py', 'a', encoding='utf-8') as f:
    f.write('''
def delete_account_and_data(user_id: str) -> bool:
    """Hard delete a user account and cascade delete all their data (jobs, resumes, profile, goals)."""
    if not user_id: return False
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            # Foreign keys usually cascade if PRAGMA foreign_keys = ON is set, but manual deletion is safer for now.
            cursor.execute("DELETE FROM jobs WHERE user_id = ?", (user_id,))
            cursor.execute("DELETE FROM resumes WHERE user_id = ?", (user_id,))
            cursor.execute("DELETE FROM user_goals WHERE user_id = ?", (user_id,))
            cursor.execute("DELETE FROM user_profiles WHERE id = ?", (user_id,))
            conn.commit()
            return cursor.rowcount > 0 or True # Return true since the user might not have all rows
    except sqlite3.Error as e:
        print(f"Error deleting account data: {e}")
        return False
''')
print('Added db deletion logic')
