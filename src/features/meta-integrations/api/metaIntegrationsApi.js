import { facebookAdsApi } from './facebookAdsApi'
import { facebookMetaApi } from './facebookMetaApi'
import { messengerMetaApi } from './messengerMetaApi'
import { whatsappMetaApi } from './whatsappMetaApi'

export const metaIntegrationsApi = {
  ads: facebookAdsApi,
  facebook: facebookMetaApi,
  messenger: messengerMetaApi,
  whatsapp: whatsappMetaApi,
}

export {
  facebookAdsApi,
  facebookMetaApi,
  messengerMetaApi,
  whatsappMetaApi,
}
