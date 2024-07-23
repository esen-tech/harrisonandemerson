import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

const HomePage = () => {
  return null
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default HomePage
