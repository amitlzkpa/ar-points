<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col class="lg-2">
        <div v-if="user" style="text-align: center;">
          <h3>Welcome {{user.sso.profile.name}}</h3>
        </div>

        <v-divider></v-divider>

        <div>
          <v-form>
            <v-container>
              <p>Create new project</p>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="newProjectName" label="Project Name" single-line></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field label="Project Description" single-line v-model="newProjectDescription"></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-btn @click="newProjectClicked" class="green lighten-2" :enabled="!!newProjectName">
                  <v-icon left>mdi-plus</v-icon>
                  <span>Create</span>
                </v-btn>
              </v-row>
            </v-container>
          </v-form>
          <div style="height: 20px;"></div>
        </div>

        <v-divider></v-divider>

        <div>
          <v-row align="center" justify="center">
            <h4>Projects</h4>
            <v-spacer></v-spacer>

            <v-tooltip v-if="!viewList" bottom light>
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on" class="mx-2" fab light text @click="viewList = !viewList">
                  <v-icon dark>
                    mdi-format-list-bulleted-square
                  </v-icon>
                </v-btn>
              </template>
              <span>List View</span>
            </v-tooltip>


            <v-tooltip v-if="viewList" bottom light>
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on" class="mx-2" fab light text @click="viewList = !viewList">
                  <v-icon dark>
                    mdi-grid
                  </v-icon>
                </v-btn>
              </template>
              <span>Grid View</span>
            </v-tooltip>

            <v-menu rounded="0" offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on" class="mx-2" fab light text>
                  <v-icon dark>
                    mdi-sort
                  </v-icon>
                </v-btn>
              </template>
              <v-list flat>
                <v-list-item-group v-model="selectedSortOption" color="green">
                  <v-list-item>
                    <v-list-item-title>by Name</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>by Date</v-list-item-title>
                  </v-list-item>
                   <v-list-item>
                    <v-list-item-title>by Author</v-list-item-title>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-menu>

            <!-- <v-tooltip bottom light>
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on" class="mx-2" fab light text>
                  <v-icon dark>
                    mdi-sort
                  </v-icon>
                </v-btn>
              </template>
              <span>Sort Options</span>
            </v-tooltip> -->


          </v-row>

        </div>


        <div v-if="projects.length < 1">
          you haven't created a project yet
        </div>

        <div v-else>

          <v-container v-if="!viewList">
            <v-row>
              <v-col v-for="p in projects" :key="p._id" cols="12" sm="4" md="3">
                <projectCard :project="p"></projectCard>
              </v-col>
            </v-row>
          </v-container>

          <v-simple-table v-if="viewList">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">Name</th>
                  <th class="text-left">Created by</th>
                  <th class="text-left">Date</th>
                  <th class="text-left"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in projects" :key="p._id">
                  <td class="text-subtitle-1 font-weight-medium text-capitalize text-truncate">{{ p.name }}
                    <v-tooltip bottom light>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon v-bind="attrs" v-on="on">mdi-account-multiple</v-icon>
                      </template>
                      <span>Shared</span>
                    </v-tooltip>

                    <v-tooltip bottom light>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon v-bind="attrs" v-on="on">mdi-eye</v-icon>
                      </template>
                      <span>Public</span>
                    </v-tooltip>
                  </td>
                  <td v-if="user._id == p.created.user._id">me</td>
                  <td v-else>{{ p.created.user.sso.profile.name}}</td>
                  <td>{{ p.created.date  | formatDate}}</td>
                  <td class="text-right">
                    <v-menu bottom right>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item v-for="(item, i) in actions" :key="i" @click="item.action(p._id)">
                          <v-list-item-icon>
                            <v-icon v-text="item.icon"></v-icon>
                          </v-list-item-icon>
                          <v-list-item-title>{{ item.title }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>


        </div>

      </v-col>
    </v-row>


  </v-container>


</template>

<script>
  import projectCard from '@/components/projectCard.vue'
  export default {
    components: {
      projectCard,
    },
    data() {
      return {
        newProjectName: '',
        newProjectDescription: '',
        projects: [],
        selectedSortOption: 1,
        reverse: false,
        viewList: false,
        actions: [{
            title: 'Edit',
            icon: 'mdi-playlist-edit',
            action: this.edit
          },
          {
            title: 'Delete',
            icon: 'mdi-trash-can-outline',
            action: this.delete
          }
        ]
      }
    },
    computed: {
      user() {
        return this.$store.getters.getUser
      }
    },
    watch: {
      selectedSortOption: function (val) {
        this.sortProjects();
      },

    },
    async mounted() {
        this.projects = await $.get("/api/projects/get-all");
        console.log("user", this.user);
        console.log("projects", this.projects);
    
    },
    filters: {
      formatDate: function (dateString) {
        const options = {
          year: "numeric",
          month: "long",
          day: "numeric"
        }
        return new Date(dateString).toLocaleDateString(undefined, options)
        //return moment(date).format("M D,YYYY");
      }
    },
    methods: {
      async newProjectClicked() {
        let postData = {
          name: this.newProjectName,
          description: this.newProjectDescription
        };
        let newProject = await $.post("/api/projects/new", postData);
        this.projects.push(newProject);
      },
      edit() {
        alert('edit project!');
      },
      delete() {
        alert('delete project!');
    },
    sortProjects(){
      console.log("sort projects method fired", this.selectedSortOption);

      if (this.selectedSortOption === 0) {
        if (!this.reverse) this.projects.sort((a, b) => (a.name < b.name) ? 1 : -1);
        else this.projects.sort((a, b) => (a.name > b.name) ? 1 : -1);
      } else if (this.selectedSortOption === 1) {
        if (!this.reverse) this.projects.sort((a, b) => (a.created.date < b.created.date) ? 1 : -1);
        else this.projects.sort((a, b) => (a.created.date > b.created.date) ? 1 : -1);
      } else if (this.projects=== 2) {
        if (!this.reverse) this.projects.sort((a, b) => (a.created.date.user.sso.profile.name< b.created.date.user.sso.profile.name) ? 1 : -1);
        else this.projects.sort((a, b) => (a.created.date.user.sso.profile.name > b.created.date.user.sso.profile.name) ? 1 : -1);
      }
    }
  }
}

</script>

<style scoped>
</style>
