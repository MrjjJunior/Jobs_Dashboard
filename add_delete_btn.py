with open('src/components/ProfileModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#90A955] hover:bg-[#a2be64] active:scale-98 text-[#00221f] rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{savedSuccess ? 'Saved!' : 'Save Profile'}</span>
                  </button>
                </div>
              </form>'''

new_content = '''                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#90A955] hover:bg-[#a2be64] active:scale-98 text-[#00221f] rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{savedSuccess ? 'Saved!' : 'Save Profile'}</span>
                  </button>
                </div>
                
                <div className="pt-6 mt-6 border-t border-[#917C78]/30">
                  <h3 className="text-sm font-bold text-rose-500 mb-2">Danger Zone</h3>
                  <p className="text-xs text-[#F3E8EE]/60 mb-3">
                    Permanently delete your account, jobs, and uploaded files. This action cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if(confirm('Are you absolutely sure you want to delete your account and all associated data?')) {
                        // Trigger backend deletion
                        fetch('/api/users/me', {
                          method: 'DELETE',
                          headers: { 'X-User-Id': userProfile.id || '' }
                        }).then(() => {
                           localStorage.clear();
                           window.location.reload();
                        });
                      }
                    }}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </form>'''

content = content.replace(target, new_content)

with open('src/components/ProfileModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
