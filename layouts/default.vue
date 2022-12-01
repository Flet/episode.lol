<template>
  <div class="container">
    <CThemeProvider>
      <CColorModeProvider>
        <CBox
          font-family="body"
          as="main"
        >
          <CReset />

          <c-box>
            <c-flex
              justify-content="space-between"
              h="16"
              align-items="center"
            >
              <c-box>Logo</c-box>
              <c-flex align-items="center">
                <c-stack
                  direction="row"
                  spacing="7"
                >
                  <c-button @click="chakraToggleColorMode">
                    {{
                    colorMode === 'light' ?   <c-icon
                      name="moon"
                      color="green.300"
                    /> :  <c-icon
                      name="sun"
                      color="green.400"
                    />
                    }}
                  </c-button>
                </c-stack>
              </c-flex>
            </c-flex>
          </c-box>

          <Nuxt />
        </CBox>
      </CColorModeProvider>
    </CThemeProvider>
  </div>
</template>
<script>
import SiteHeader from '../components/SiteHeader'
import {
  CThemeProvider,
  CColorModeProvider,
  CReset,
  CBox,
  CFlex,
  CAvatar,
  CLink,
  CButton,
  CMenu,
  CMenuButton,
  CMenuList,
  CMenuItem,
  CMenuDivider,
  CStack
} from '@chakra-ui/vue'

export default {
  components: {
    SiteHeader,
    CThemeProvider,
    CColorModeProvider,
    CReset,
    CAvatar,
    CLink,
    CButton,
    CMenu,
    CMenuButton,
    CMenuList,
    CMenuItem,
    CMenuDivider,
    CStack,
    CBox,
    CFlex
  }
}
</script>
<style>
</style>
