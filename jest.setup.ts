import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// The codebase uses data-test-id (not the library default of data-testid)
configure({ testIdAttribute: 'data-test-id' })
