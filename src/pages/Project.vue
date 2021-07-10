
<template>
     <div v-if="project">
            
    
        <v-tabs v-model="tab" align-with-title>
          <v-tab>Info</v-tab>
          <v-tab>Users</v-tab>
        </v-tabs>

         <v-tabs-items v-model="tab">
      <v-tab-item key="Info">
        <v-card flat>
          
           <div style="text-align: center;">
             <h3>Info</h3>
      <h3>single Project Page</h3>
      <h4>Name : {{project.name}}</h4>
      <h5>project level permissions: {{project.curPermissions}}</h5>
    </div>
        </v-card>

      </v-tab-item>
        <v-tab-item key="Users">
        <h1>Users</h1>
        <!-- <v-card flat>
          <v-card-text v-text="text"></v-card-text>
        </v-card> -->
      </v-tab-item>
    </v-tabs-items>

     

   
  </div>
</template>

<script>

export default {
  props: [],
  data() {
    return {
      project: null,
      tab:null
    };
  },
  computed: {
    user() {
      return this.$store.getters.getUser
    }
  },
  created() {
    let projectId = this.$route.params.id;
    let route = "/api/project/" + projectId + "/info";

    $.get(route).then(returnProject => {

      this.$store.commit('setProject', returnProject);
      this.project = returnProject;

    }).fail(function (err) {
      console.log("err", err);
      component.$router.push({ //redirect to 404
        name: 'NotFound'
      });;
    });

  },
  destroyed() {
    //before leave the component, set global project variable null
    this.$store.commit('setProject', null);
  },

}
</script>


