with open('backend/routers/profile.py', 'a', encoding='utf-8') as f:
    f.write('''
@router.delete("/users/me")
def delete_user_account(x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    """Hard delete user account and all associated data."""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    success = db.delete_account_and_data(x_user_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete account.")
    return {"status": "success", "message": "Account deleted."}
''')
print('Added delete endpoint to profile.py')
