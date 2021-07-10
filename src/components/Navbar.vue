<template>
  <nav>
    <v-app-bar elevation="0" text app class="green">
      <v-btn text fab :to="{ path: '/' }">
        <v-icon>mdi-home</v-icon>
      </v-btn>

      <v-toolbar-title class="text-uppercase black--text">
        <span class="font-weight-light">AR</span>
        <span>Points</span>
      </v-toolbar-title>

      <!-- if project, add project related navigation -->
      <div class="pa-2 text-capitalize">
        <span v-if="project"> {{ project.name }}</span>
      </div>

      <v-spacer></v-spacer>
      <v-btn text color="white" v-if="!user" href="/users/login">
        <span>Login</span>
        <v-icon right>mdi-login</v-icon>
      </v-btn>

      <div v-else>
        <v-avatar>
          <img :src="user.sso.gravatarLink" />
        </v-avatar>

        <v-menu bottom :close-on-content-click="false">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-card class="mx-auto" width="300">
            <v-list>
              <v-subheader
                class="text-subtitle-1 font-weight-medium text-capitalize"
                >{{ user.sso.profile.name }}
              </v-subheader>

              <v-list-group
                v-if="user.permissions.admin"
                :value="true"
                no-action
                sub-group
              >
                <template v-slot:activator>
                  <v-list-item-content>
                    <v-list-item-title>Admin</v-list-item-title>
                  </v-list-item-content>
                </template>

                <v-list-item
                  v-for="(item, i) in admins"
                  :key="i"
                  :to="{ path: item.to }"
                >
                  <v-list-item-title v-text="item.title"></v-list-item-title>
                  <v-list-item-icon>
                    <v-icon v-text="item.icon"></v-icon>
                  </v-list-item-icon>
                </v-list-item>
              </v-list-group>

              <v-list-item-group>
                <v-list-item href="/users/logout">
                  <v-list-item-icon>
                    <v-icon>mdi-exit-to-app</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>Logout</v-list-item-title>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card>
        </v-menu>
      </div>
    </v-app-bar>
  </nav>
</template>

<script>
export default {
  data: () => ({
    admins: [
      {
        icon: "mdi-account-multiple-outline",
        title: "Manage Users",
        to: "/admin",
      },
    ],
  }),
  computed: {
    user() {
      return this.$store.getters.getUser;
    },
    project() {
      return this.$store.getters.getProject;
    },
  },
};
</script>
