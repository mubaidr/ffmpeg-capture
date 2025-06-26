#!/usr/bin/env node

// Simple test script to verify basic functionality
import {
  checkFfmpegAvailability,
  createRecorder,
  detectCaptureMethods,
  getDefaultAudioDevice,
  validateRecorderOptions,
} from '../dist/index.mjs'

async function runBasicTests() {
  console.log('🧪 Running basic functionality tests...\n')

  // Test 1: FFmpeg availability
  console.log('1. Checking FFmpeg availability...')
  try {
    const isAvailable = await checkFfmpegAvailability()
    console.log(`   ✅ FFmpeg available: ${isAvailable}`)
  }
  catch (error) {
    console.log(`   ❌ Error checking FFmpeg: ${error.message}`)
  }

  // Test 2: Detect capture methods
  console.log('\n2. Detecting capture methods...')
  try {
    const methods = await detectCaptureMethods()
    console.log(`   ✅ Video methods: ${methods.video.join(', ')}`)
    console.log(`   ✅ Audio methods: ${methods.audio.join(', ')}`)
    if (methods.displayServer) {
      console.log(`   ✅ Display server: ${methods.displayServer}`)
    }
  }
  catch (error) {
    console.log(`   ❌ Error detecting methods: ${error.message}`)
  }

  // Test 3: Get default audio device
  console.log('\n3. Getting default audio device...')
  try {
    const device = getDefaultAudioDevice()
    console.log(`   ✅ Default audio device: ${device}`)
  }
  catch (error) {
    console.log(`   ❌ Error getting audio device: ${error.message}`)
  }

  // Test 4: Validate options
  console.log('\n4. Testing option validation...')
  try {
    validateRecorderOptions({
      input: 'screen',
      output: 'test.mp4',
    })
    console.log('   ✅ Valid options accepted')

    try {
      validateRecorderOptions({
        input: 'invalid',
        output: 'test.mp4',
      })
      console.log('   ❌ Invalid options should have been rejected')
    }
    catch (validationError) {
      console.log('   ✅ Invalid options correctly rejected')
    }
  }
  catch (error) {
    console.log(`   ❌ Error in validation: ${error.message}`)
  }

  // Test 5: Create recorder (without starting)
  console.log('\n5. Creating recorder instance...')
  try {
    const recorder = await createRecorder({
      input: 'screen',
      output: 'test-output.mp4',
      fps: 15,
    })
    console.log('   ✅ Recorder created successfully')
    console.log(`   ✅ Recording status: ${recorder.isRecording}`)
    console.log(`   ✅ Process status: ${recorder.process === null ? 'null' : 'exists'}`)
  }
  catch (error) {
    console.log(`   ❌ Error creating recorder: ${error.message}`)
  }

  console.log('\n🎉 Basic tests completed!')
}

runBasicTests().catch(console.error)
