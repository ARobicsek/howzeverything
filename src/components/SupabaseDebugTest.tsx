// src/components/SupabaseDebugTest.tsx  
import React, { useState } from 'react'  
import { supabase, withTimeout } from '../supabaseClient'  
import { COLORS, FONTS } from '../constants'  
import type { PostgrestSingleResponse } from '@supabase/supabase-js'  
import type { DatabaseUser } from '../supabaseClient' // Assuming DatabaseUser from supabaseClient.ts  
import type { Database } from '../types/supabase' // Import Database for precise row types

const SupabaseDebugTest: React.FC = () => {  
  const [results, setResults] = useState<string[]>([])  
  const [testing, setTesting] = useState(false)

  const log = (message: string) => {  
    console.log(message)  
    setResults(prev => [...prev, `${new Date().toISOString()}: ${message}`])  
  }

  const runTests = async () => {  
    setTesting(true)  
    setResults([])

    try {  
      // Test 1: Check auth status  
      log('🔍 Test 1: Checking auth status...')  
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()  
       
      if (sessionError) {  
        log(`❌ Auth error: ${sessionError.message}`)  
      } else if (session) {  
        log(`✅ Authenticated as: ${session.user.email} (ID: ${session.user.id})`)  
      } else {  
        log('❌ No active session')  
        return  
      }

      if (!session) {  
        log('⚠️ Cannot proceed without authentication')  
        return  
      }

      const userId = session.user.id

      // Test 2: Direct database connection test  
      log('🔍 Test 2: Testing database connection...')  
      try {  
        // Let TypeScript infer the correct type instead of explicit annotation
        const result = await withTimeout(  
          // Wrap the PostgrestFilterBuilder in Promise.resolve()  
          Promise.resolve(  
            supabase  
              .from('users')  
              .select('id')  
              .limit(1)  
          ),  
          5000  
        )  
         
        if (result.error) {  
          log(`❌ Database connection error: ${result.error.message}`)  
        } else {  
          log('✅ Database connection successful')  
        }  
      } catch (err: any) {  
        log(`❌ Database exception: ${err.message}`)  
      }

      // Test 3: Test RLS policy for current user  
      log('🔍 Test 3: Testing RLS policy for current user...')  
       
      try {  
        const startTime = Date.now()  
        const result: PostgrestSingleResponse<DatabaseUser> = await withTimeout(  
          // Wrap the PostgrestFilterBuilder in Promise.resolve()  
          Promise.resolve(  
            supabase  
              .from('users')  
              .select('*') // Use '*' for explicit full row selection  
              .eq('id', userId)  
              .single()  
          ),  
          5000  
        )  
         
        const duration = Date.now() - startTime  
        log(`⏱️ Query duration: ${duration}ms`)  
         
        if (result.error) {  
          log(`❌ Profile query error: ${result.error.message}`)  
          log(`❌ Error code: ${result.error.code}`)  
          if (result.error.code === 'PGRST116' || result.error.code === '406') {  
            log('ℹ️ 406/PGRST116 errors are common with certain Supabase configurations or if profile does not exist.')  
            log('ℹ️ The app should still work despite these errors, especially if a profile is created subsequently.')  
          }  
        } else if (result.data) {  
          log('✅ Profile query successful')  
          log(`✅ Profile data: ${JSON.stringify(result.data, null, 2)}`)  
        } else {  
          log('⚠️ No profile found for current user (or query returned empty data)')  
        }  
      } catch (err: any) {  
        log(`❌ Profile query exception: ${err.message}`)  
      }

      // Test 4: Test creating a profile  
      log('🔍 Test 4: Testing profile creation (if needed)...')  
      try {  
        // Let TypeScript infer the correct type instead of explicit annotation
        const existingResult = await withTimeout(  
          // Wrap the PostgrestFilterBuilder in Promise.resolve()  
          Promise.resolve(  
            supabase  
              .from('users')  
              .select('id') // This selects only 'id'  
              .eq('id', userId)  
              .single()  
          ),  
          5000  
        )  
         
        if (existingResult.data) {  
          log('ℹ️ Profile already exists, skipping creation test')  
        } else {  
          log('📝 Attempting to create profile...')  
          const createResult: PostgrestSingleResponse<DatabaseUser> = await withTimeout(  
            // Wrap the PostgrestFilterBuilder in Promise.resolve()  
            Promise.resolve(  
              supabase  
                .from('users')  
                .insert({  
                  id: userId,  
                  email: session.user.email!,  
                  full_name: session.user.email?.split('@')[0] || 'Test User',  
                  bio: 'Test profile',  
                  location: 'Test Location',  
                  is_admin: false  
                })  
                .select()  
                .single()  
            ),  
            5000  
          )  
           
          if (createResult.error) {  
            log(`❌ Profile creation error: ${createResult.error.message}`)  
            log(`❌ Error code: ${createResult.error.code}`)  
            if (createResult.error.code === '23505') {  
                log('ℹ️ Profile likely already exists, race condition or previous failed attempt.')  
            }  
          } else if (createResult.data) {  
            log('✅ Profile created successfully')  
            log(`✅ New profile: ${JSON.stringify(createResult.data, null, 2)}`)  
          }  
        }  
      } catch (err: any) {  
        log(`❌ Profile creation exception: ${err.message}`)  
      }

      // Test 5: Test RLS policies work correctly  
      log('🔍 Test 5: Testing RLS policy restrictions...')  
      try {  
        // Let TypeScript infer the correct type instead of explicit annotation
        const otherResult = await withTimeout(  
          // Wrap the PostgrestFilterBuilder in Promise.resolve()  
          Promise.resolve(  
            supabase  
              .from('users')  
              .select('*') // Use '*' for explicit full row selection  
              .neq('id', userId)  
              .limit(1)  
          ),  
          5000  
        )  
         
        if (otherResult.error) {  
          log(`ℹ️ RLS restriction error (expected if policy restricts): ${otherResult.error.message}`)  
        } else if (otherResult.data && otherResult.data.length > 0) {  
          log('✅ Can view other profiles (policy allows authenticated users to view all)')  
        } else {  
          log('ℹ️ No other profiles found or RLS restricts access (expected behavior for some RLS configurations)')  
        }  
      } catch (err: any) {  
        log(`❌ RLS test exception: ${err.message}`)  
      }

    } catch (err: any) {  
      log(`❌ Test suite error: ${err.message}`)  
    } finally {  
      setTesting(false)  
      log('🏁 Tests completed')  
    }  
  }

  return (  
    <div style={{  
      position: 'fixed',  
      top: '50%',  
      left: '50%',  
      transform: 'translate(-50%, -50%)',  
      backgroundColor: 'white',  
      padding: '24px',  
      borderRadius: '12px',  
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',  
      maxWidth: '600px',  
      width: '90%',  
      maxHeight: '80vh',  
      display: 'flex',  
      flexDirection: 'column',  
      zIndex: 1000  
    }}>  
      <h2 style={{  
        ...FONTS.elegant,  
        fontSize: '20px',  
        fontWeight: '600',  
        marginBottom: '16px',  
        color: COLORS.text  
      }}>  
        Supabase Debug Test  
      </h2>  
       
      <button  
        onClick={runTests}  
        disabled={testing}  
        style={{  
          ...FONTS.elegant,  
          padding: '12px 24px',  
          backgroundColor: testing ? COLORS.disabled : COLORS.primary,  
          color: 'white',  
          border: 'none',  
          borderRadius: '8px',  
          cursor: testing ? 'not-allowed' : 'pointer',  
          marginBottom: '16px'  
        }}  
      >  
        {testing ? 'Running Tests...' : 'Run Debug Tests'}  
      </button>  
       
      <div style={{  
        flex: 1,  
        overflowY: 'auto',  
        backgroundColor: '#f5f5f5',  
        padding: '12px',  
        borderRadius: '8px',  
        fontFamily: 'monospace',  
        fontSize: '12px',  
        lineHeight: '1.5'  
      }}>  
        {results.length === 0 ? (  
          <p style={{ color: COLORS.disabled }}>Click "Run Debug Tests" to start...</p>  
        ) : (  
          results.map((result, index) => (  
            <div key={index} style={{ marginBottom: '4px' }}>  
              {result}  
            </div>  
          ))  
        )}  
      </div>  
    </div>  
  )  
}

export default SupabaseDebugTest