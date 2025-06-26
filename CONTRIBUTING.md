# Contributing to FFmpeg Capture

Thank you for your interest in contributing to FFmpeg Capture! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 18+
- npm (latest version)
- FFmpeg installed on your system (for testing)
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/ffmpeg-capture.git
   cd ffmpeg-capture
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests to ensure everything works**
   ```bash
   npm test
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## Development Workflow

### Project Structure

```
ffmpeg-capture/
├── src/                    # Source code
│   └── index.ts           # Main library code
├── test/                  # Test files
│   └── index.test.ts      # Test suite
├── examples/              # Usage examples
├── docs/                  # Documentation
├── .github/workflows/     # CI/CD workflows
└── dist/                  # Built files (generated)
```

### Available Scripts

- `npm run build` - Build the project
- `npm run dev` - Build in watch mode
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run typecheck` - Type checking
- `npm run start` - Run examples

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following the existing style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   npm run typecheck
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Tests are located in the `test/` directory
- Use Vitest for testing framework
- Write tests for new features and bug fixes
- Ensure tests work across platforms when possible

Example test:
```typescript
import { describe, expect, it } from 'vitest'
import { createRecorder } from '../src'

describe('feature name', () => {
  it('should do something', async () => {
    const recorder = await createRecorder({
      input: 'screen',
      output: 'test.mp4'
    })

    expect(recorder).toBeDefined()
    expect(recorder.isRecording).toBe(false)
  })
})
```

## Documentation

### Code Documentation

- Use JSDoc comments for public APIs
- Include examples in documentation
- Document complex algorithms and platform-specific code

### README Updates

When adding new features:
- Update the features list
- Add usage examples
- Update API documentation
- Add to the roadmap if applicable

## Contribution Guidelines

### Code Style

- Use TypeScript for all code
- Follow existing code style (ESLint configuration)
- Use meaningful variable and function names
- Keep functions small and focused

### Commit Messages

Follow conventional commits format:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions/changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `chore:` - Maintenance tasks

Examples:
```
feat: add support for H.265 encoding
fix: resolve audio sync issues on Windows
docs: update cross-platform setup guide
test: add tests for quality presets
```

### Pull Request Guidelines

1. **Provide a clear description**
   - What does this PR do?
   - Why is this change needed?
   - How was it tested?

2. **Keep PRs focused**
   - One feature/fix per PR
   - Avoid unrelated changes

3. **Update documentation**
   - Update README if needed
   - Add/update JSDoc comments
   - Update examples if applicable

4. **Ensure CI passes**
   - All tests must pass
   - No linting errors
   - TypeScript compilation succeeds

## Bug Reports

When reporting bugs, please include:

1. **Environment information**
   - Operating system and version
   - Node.js version
   - FFmpeg version
   - Library version

2. **Steps to reproduce**
   - Minimal code example
   - Expected behavior
   - Actual behavior

3. **Additional context**
   - Error messages
   - Console output
   - Screenshots if applicable

## Feature Requests

When requesting features:

1. **Describe the use case**
   - What problem does this solve?
   - Who would benefit from this feature?

2. **Provide examples**
   - How would the API look?
   - Usage examples

3. **Consider alternatives**
   - Are there existing workarounds?
   - How do other libraries handle this?

## Platform-Specific Development

### Testing on Different Platforms

- **macOS**: Test AVFoundation integration
- **Windows**: Test GDI grab and DirectShow
- **Linux**: Test X11 and Wayland support

### Platform-Specific Code

When adding platform-specific features:
- Use platform detection (`process.platform`)
- Provide fallbacks when possible
- Document platform requirements
- Test on target platforms

## Release Process

Releases are handled by maintainers:

1. Version bump using `npm run release`
2. Automated testing via GitHub Actions
3. Automatic npm publishing on tag creation
4. Changelog generation

## Community

### Getting Help

- Documentation: https://github.com/mubaidr/ffmpeg-capture/tree/main/docs
- Issue Tracker: https://github.com/mubaidr/ffmpeg-capture/issues
- Discussions: https://github.com/mubaidr/ffmpeg-capture/discussions

### Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Focus on constructive feedback
- Celebrate contributions of all sizes

## License

By contributing to FFmpeg Capture, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to FFmpeg Capture!
