import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import {WelcomeModal} from '@pages/main/App.tsx'
//import Reader from '@pages/main/Reader.tsx'

test('renders WelcomeModal', async () => {
  const { getByText } = await render(<WelcomeModal/>)
  await expect.element(getByText('Welcome!')).toBeInTheDocument()
})

/*
test('App is there', async () => {
	const {getByText} = await render(<Reader/>)
	await expect.element(getByText('Mark')).toBeInTheDocument()
})
*/
